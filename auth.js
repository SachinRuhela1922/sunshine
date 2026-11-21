// ==========================================
// AUTH + SECURITY MIDDLEWARE
// ------------------------------------------
// Har /api request ke liye login token zaroori hai (sirf login routes khule hain).
// Token server ke TOKEN_SECRET se sign hota hai, isliye browser me badla nahi ja sakta.
//
// Roles:
//   admin   -> sab kuch
//   teacher -> sirf TEACHER_RULES wale routes (Aadhaar data hata ke milta hai)
//   student -> sirf apna exam-marks / attendance / fee record
// ==========================================

const crypto = require("crypto");

const TOKEN_TTL_MS = {
    admin: 12 * 60 * 60 * 1000,          // 12 ghante
    teacher: 7 * 24 * 60 * 60 * 1000,    // 7 din
    student: 7 * 24 * 60 * 60 * 1000     // 7 din
};

function getSecret() {
    const secret = String(process.env.TOKEN_SECRET || "").trim();
    if (secret.length < 32) {
        throw new Error("TOKEN_SECRET env variable must be set (at least 32 characters).");
    }
    return secret;
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

function sign(data) {
    return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

function createToken(payload) {
    const body = b64url(JSON.stringify({
        ...payload,
        exp: Date.now() + (TOKEN_TTL_MS[payload.role] || TOKEN_TTL_MS.student)
    }));
    return body + "." + sign(body);
}

function verifyToken(token) {
    if (typeof token !== "string") return null;

    const [body, signature] = token.split(".");
    if (!body || !signature) return null;

    const expected = Buffer.from(sign(body));
    const given = Buffer.from(signature);

    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
        if (!payload || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}

// Constant-time string compare (admin password ke liye)
function safeEqual(a, b) {
    const ha = crypto.createHash("sha256").update(String(a)).digest();
    const hb = crypto.createHash("sha256").update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}


// ==========================================
// ROUTE PERMISSIONS
// ==========================================

// Bina login ke sirf ye routes khule hain
const PUBLIC_ROUTES = [
    ["POST", /^\/api\/admin\/login$/],
    ["POST", /^\/api\/teachers\/login$/],
    ["POST", /^\/api\/students\/login$/]
];

// Teacher pages (attendance2, exam2, exam-student2, result2, teacher,
// view-notice, view-syllabus, view-time-table) sirf yahi APIs use karte hain
const TEACHER_RULES = [
    ["GET", /^\/api\/students$/],
    ["GET", /^\/api\/students\/class\/[^/]+$/],
    ["POST", /^\/api\/attendance$/],
    ["GET", /^\/api\/exam\/classes$/],
    ["GET", /^\/api\/exam\/classes\/[^/]+\/students$/],
    ["GET", /^\/api\/exam-marks$/],
    ["GET", /^\/api\/exam-marks\/[^/]+\/[^/]+$/],
    ["POST", /^\/api\/exam-marks$/],
    ["PUT", /^\/api\/exam-marks\/[^/]+$/],
    ["GET", /^\/api\/admitcard\/download$/],
    ["GET", /^\/api\/syllabus$/],
    ["GET", /^\/api\/syllabus\/[^/]+$/],
    ["GET", /^\/api\/teacher-attendance\/[^/]+$/],
    ["GET", /^\/api\/notices$/],
    ["GET", /^\/api\/classes$/],
    ["GET", /^\/api\/timetable$/],
    ["GET", /^\/api\/timetable\/[^/]+$/]
];

// Student sirf apni studentId (STDxxxx) wale records dekh sakta hai
const STUDENT_RULES = [
    ["GET", /^\/api\/student\/exam-marks\/([^/]+)$/],
    ["GET", /^\/api\/student\/attendance\/([^/]+)$/],
    ["GET", /^\/api\/payments\/student\/([^/]+)$/]
];

function matchRule(rules, method, path) {
    for (const [m, re] of rules) {
        if (m === method) {
            const match = path.match(re);
            if (match) return match;
        }
    }
    return null;
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}


// ==========================================
// TEACHER RESPONSE REDACTION
// Teacher ko students ka Aadhaar number / image nahi bhejna
// ==========================================

function redactForTeacher(value) {
    if (Array.isArray(value)) return value.map(redactForTeacher);

    if (value && typeof value === "object") {
        if (typeof value.toJSON === "function" && !(value instanceof Date)) {
            value = value.toJSON();
        }
        if (value instanceof Date || typeof value !== "object" || value === null) return value;

        const out = {};
        for (const [key, val] of Object.entries(value)) {
            if (/aadha+r/i.test(key) || key === "password") continue;
            out[key] = redactForTeacher(val);
        }
        return out;
    }

    return value;
}


/**
 * Main auth middleware.
 * @param {object} deps - { Teacher } model, taaki deleted/inactive teacher ka token turant band ho
 */
function authMiddleware({ Teacher }) {

    return async (req, res, next) => {

        if (req.method === "OPTIONS") return next();

        // /api ke bahar wale routes (jaise "/") khule rahenge
        if (!req.path.startsWith("/api/") && req.path !== "/api") return next();

        if (matchRule(PUBLIC_ROUTES, req.method, req.path)) return next();

        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
        const user = verifyToken(token);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Please login again."
            });
        }

        req.user = user;

        if (user.role === "admin") return next();

        if (user.role === "teacher") {

            if (!matchRule(TEACHER_RULES, req.method, req.path)) {
                return res.status(403).json({ success: false, message: "Access denied." });
            }

            // Deleted / inactive teacher ka purana token kaam nahi karega
            try {
                const active = await Teacher.exists({ _id: user.id, status: "active" });
                if (!active) {
                    return res.status(401).json({ success: false, message: "Please login again." });
                }
            } catch {
                return res.status(401).json({ success: false, message: "Please login again." });
            }

            const originalJson = res.json.bind(res);
            res.json = (body) => originalJson(redactForTeacher(body));

            return next();
        }

        if (user.role === "student") {

            const match = matchRule(STUDENT_RULES, req.method, req.path);

            if (!match || safeDecode(match[1]) !== String(user.studentId)) {
                return res.status(403).json({ success: false, message: "Access denied." });
            }

            return next();
        }

        return res.status(401).json({ success: false, message: "Please login again." });
    };
}


// ==========================================
// BODY SANITIZER
//  - "$" se shuru hone wali keys hata deta hai (NoSQL injection, jaise {"$ne": ""})
//  - text me se < > hata deta hai taaki koi <script> save na ho (stored XSS)
//    (password fields ko chhod deta hai taaki login na toote)
// ==========================================

const SKIP_HTML_STRIP = new Set(["password", "newPassword"]);

function sanitizeValue(value, key) {

    if (typeof value === "string") {
        return SKIP_HTML_STRIP.has(key) ? value : value.replace(/[<>]/g, "");
    }

    if (Array.isArray(value)) {
        return value.map(v => sanitizeValue(v, key));
    }

    if (value && typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (k.startsWith("$") || k === "__proto__" || k === "constructor" || k === "prototype") continue;
            out[k] = sanitizeValue(v, k);
        }
        return out;
    }

    return value;
}

function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeValue(req.body, "");
    }
    next();
}


// ==========================================
// LOGIN RATE LIMIT (memory me, per IP)
// 15 minute me 10 galat try ke baad block
// ==========================================

function loginRateLimit({ windowMs = 15 * 60 * 1000, max = 10 } = {}) {

    const hits = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    }, windowMs).unref();

    return (req, res, next) => {

        const key = req.ip + "|" + req.path;
        const now = Date.now();
        let entry = hits.get(key);

        if (!entry || entry.reset < now) {
            entry = { count: 0, reset: now + windowMs };
            hits.set(key, entry);
        }

        if (entry.count >= max) {
            return res.status(429).json({
                success: false,
                message: "Too many login attempts. Please try again after 15 minutes."
            });
        }

        // Sirf fail hone wale attempts count karo
        res.on("finish", () => {
            if (res.statusCode === 401) entry.count += 1;
            else if (res.statusCode === 200) hits.delete(key);
        });

        next();
    };
}

module.exports = {
    createToken,
    verifyToken,
    safeEqual,
    authMiddleware,
    sanitizeBody,
    loginRateLimit,
    getSecret
};
