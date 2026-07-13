const express = require("express");
const os = require("os");

const app = express();

const startTime = new Date();
let requestCount = 0;

app.get("/", (req, res) => {
    requestCount++;
    const uptimeSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const buildId = process.env.BUILD_NUMBER || "local-dev";
    const hostname = os.hostname();

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CloudBlitz DevOps CI/CD Integration Demo</title>
            <style>
                * { box-sizing: border-box; }

                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    background: linear-gradient(135deg, #0f172a, #1e3a8a, #0f172a);
                    background-size: 400% 400%;
                    animation: gradientShift 12s ease infinite;
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                }

                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .container {
                    text-align: center;
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(10px);
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 0 30px rgba(56,189,248,0.25);
                    border: 1px solid rgba(255,255,255,0.15);
                    max-width: 760px;
                    animation: fadeIn 0.8s ease-in;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                h1 {
                    color: #38bdf8;
                    margin-bottom: 8px;
                    font-size: 30px;
                }

                h2 {
                    color: #facc15;
                    margin-bottom: 20px;
                    font-weight: 500;
                }

                p {
                    font-size: 17px;
                    line-height: 1.6;
                    color: #e2e8f0;
                }

                .pipeline {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin: 25px 0;
                }

                .pipeline span {
                    background: rgba(56,189,248,0.15);
                    border: 1px solid #38bdf8;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 14px;
                    color: #7dd3fc;
                }

                .pipeline span:not(:last-child)::after {
                    content: "→";
                    margin-left: 10px;
                    color: #64748b;
                }

                .status {
                    display: inline-block;
                    margin-top: 10px;
                    padding: 10px 22px;
                    background: #22c55e;
                    color: white;
                    border-radius: 20px;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
                    70% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
                    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
                }

                .stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 14px;
                    margin-top: 28px;
                    text-align: left;
                }

                .stat-card {
                    background: rgba(255,255,255,0.06);
                    border-radius: 10px;
                    padding: 14px;
                    border-left: 3px solid #38bdf8;
                }

                .stat-label {
                    font-size: 12px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-value {
                    font-size: 16px;
                    font-weight: bold;
                    color: #f1f5f9;
                    margin-top: 4px;
                    word-break: break-all;
                }

                footer {
                    margin-top: 28px;
                    font-size: 13px;
                    color: #94a3b8;
                }

                #liveClock {
                    color: #38bdf8;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 CloudBlitz DevOps CI/CD Integration Demo</h1>
                <h2>Welcome to the Application!</h2>

                <p>This application was automatically built, tested, and deployed by the pipeline below:</p>

                <div class="pipeline">
                    <span>GitHub</span>
                    <span>Jenkins</span>
                    <span>Docker</span>
                    <span>Deploy</span>
                    <span>Live ✅</span>
                </div>

                <div class="status">✅ Latest Build Deployed Successfully</div>

                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-label">Build Number</div>
                        <div class="stat-value">#${buildId}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Server Uptime</div>
                        <div class="stat-value">${uptimeSeconds}s</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Requests Served</div>
                        <div class="stat-value">${requestCount}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Hostname</div>
                        <div class="stat-value">${hostname}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Local Time</div>
                        <div class="stat-value" id="liveClock">--:--:--</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Node.js Version</div>
                        <div class="stat-value">${process.version}</div>
                    </div>
                </div>

                <footer>Built with ❤️ using Node.js, Express, Docker &amp; Jenkins</footer>
            </div>

            <script>
                function updateClock() {
                    const now = new Date();
                    document.getElementById('liveClock').textContent = now.toLocaleTimeString();
                }
                updateClock();
                setInterval(updateClock, 1000);
            </script>
        </body>
        </html>
    `);
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        uptimeSeconds: Math.floor((Date.now() - startTime.getTime()) / 1000),
        requestsServed: requestCount,
        buildId: process.env.BUILD_NUMBER || "local-dev"
    });
});

app.get("/api/info", (req, res) => {
    res.status(200).json({
        app: "CloudBlitz DevOps CI/CD Demo",
        hostname: os.hostname(),
        platform: os.platform(),
        nodeVersion: process.version,
        startTime: startTime.toISOString(),
        requestsServed: requestCount
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
});

module.exports = app;