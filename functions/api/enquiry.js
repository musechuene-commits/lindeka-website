export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();

        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const service = String(formData.get("service") || "").trim();
        const message = String(formData.get("message") || "").trim();
        const website = String(formData.get("website") || "").trim();

        // Honeypot anti-spam check
        if (website) {
            return new Response("Spam detected.", {
                status: 400,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            });
        }

        // Required-field validation
        if (!name || !email || !service || !message) {
            return new Response("Please complete all required fields.", {
                status: 400,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            });
        }

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return new Response("Please provide a valid email address.", {
                status: 400,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            });
        }

        return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enquiry Received | Lindeka IT & Cyber Solutions</title>

    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #071a2f;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }

        .card {
            max-width: 650px;
            width: 100%;
            background: #ffffff;
            color: #14213d;
            padding: 45px;
            border-radius: 18px;
            text-align: center;
            box-sizing: border-box;
        }

        .check {
            font-size: 60px;
            margin-bottom: 15px;
        }

        h1 {
            margin-bottom: 15px;
        }

        p {
            line-height: 1.6;
        }

        a {
            display: inline-block;
            margin-top: 20px;
            padding: 13px 24px;
            background: #8bea24;
            color: #071a2f;
            text-decoration: none;
            font-weight: bold;
            border-radius: 8px;
        }
    </style>
</head>

<body>

    <div class="card">

        <div class="check">✓</div>

        <h1>Thank You, ${escapeHtml(name)}!</h1>

        <p>
            Your enquiry has been received by Lindeka IT & Cyber Solutions.
        </p>

        <p>
            We have recorded your request for:
            <strong>${escapeHtml(service)}</strong>
        </p>

        <p>
            We will review your enquiry and get back to you.
        </p>

        <a href="https://lindeka.co.za/#contact">
            Return to Lindeka Website
        </a>

    </div>

</body>
</html>
        `, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=UTF-8"
            }
        });

    } catch (error) {
        return new Response(
            "There was a problem processing your enquiry. Please try again.",
            {
                status: 500,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            }
        );
    }
}

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
