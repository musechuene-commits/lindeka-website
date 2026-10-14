export async function onRequestPost(context) {
    const textHeaders = { "Content-Type": "text/plain; charset=UTF-8" };
    const checklistUrl = "https://lindeka.co.za/resources/Lindeka_10_Point_POPIA_Readiness_Checklist.pdf";
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[char]);

    try {
        const formData = await context.request.formData();
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const business = String(formData.get("business") || "").trim();
        const website = String(formData.get("website") || "").trim();

        if (website) {
            return new Response("Unable to process this request.", { status: 400, headers: textHeaders });
        }
        if (!name || !email) {
            return new Response("Please enter your name and business email.", { status: 400, headers: textHeaders });
        }
        if (name.length > 160 || email.length > 254 || business.length > 200) {
            return new Response("One or more fields are too long.", { status: 400, headers: textHeaders });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response("Please provide a valid business email address.", { status: 400, headers: textHeaders });
        }
        if (!context.env.RESEND_API_KEY) {
            return new Response("The checklist email service is not configured. Please try again later.", { status: 500, headers: textHeaders });
        }

        const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Lindeka IT & Cyber Solutions <website@lindeka.co.za>",
                to: [email],
                reply_to: "info@lindeka.co.za",
                subject: "Your free Lindeka POPIA Readiness Checklist",
                html: `
                    <h2>Your free 10-point POPIA readiness checklist</h2>
                    <p>Hello ${escapeHtml(name)},</p>
                    <p>Thank you for requesting the Lindeka IT &amp; Cyber Solutions checklist.</p>
                    <p><a href="${checklistUrl}">Open your POPIA Readiness Checklist (PDF)</a></p>
                    <p>Keep this link for your own reference. The checklist is an educational self-assessment only; it is not legal advice, a formal audit, certification, or a guarantee of POPIA compliance.</p>
                    <p>Questions? Reply to this email or contact <a href="mailto:info@lindeka.co.za">info@lindeka.co.za</a>.</p>
                `
            })
        });

        if (!emailResponse.ok) {
            console.error("Checklist confirmation email failed:", await emailResponse.text());
            return new Response("We couldn't send your checklist email just now. Please try again later.", { status: 502, headers: textHeaders });
        }

        // Internal notification is best-effort; don't block the requested checklist after successful delivery.
        try {
            const notifyResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: "Lindeka Website <website@lindeka.co.za>",
                    to: ["info@lindeka.co.za"],
                    reply_to: email,
                    subject: "New POPIA checklist request",
                    html: `
                        <h2>New POPIA checklist request</h2>
                        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                        <p><strong>Business email:</strong> ${escapeHtml(email)}</p>
                        <p><strong>Business name:</strong> ${business ? escapeHtml(business) : "Not provided"}</p>
                        <p>The checklist confirmation email was sent to the requester.</p>
                    `
                })
            });
            if (!notifyResponse.ok) console.error("Checklist internal notification failed:", await notifyResponse.text());
        } catch (notifyError) {
            console.error("Checklist internal notification error:", notifyError);
        }

        return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your POPIA Checklist | Lindeka IT &amp; Cyber Solutions</title>
<style>body{margin:0;padding:24px;background:#071a2f;color:#f5f8fc;font:16px/1.6 Arial,sans-serif;display:grid;place-items:center;min-height:100vh;box-sizing:border-box}.card{max-width:620px;width:100%;box-sizing:border-box;padding:34px;background:#102640;border:1px solid #2a425c;border-radius:14px}h1{line-height:1.2}a.btn{display:inline-block;background:#8bea24;color:#071a2f;padding:13px 18px;border-radius:8px;text-decoration:none;font-weight:bold;margin:12px 0}p{color:#c1cede}.small{font-size:12px}</style></head>
<body><main class="card"><h1>Thank you, ${escapeHtml(name)}.</h1><p>Your checklist request is ready. You can open the PDF now, and we've sent the link to your business email.</p><a class="btn" href="${checklistUrl}">Open the POPIA checklist PDF →</a><p class="small">This checklist is an educational self-assessment only, not legal advice, a formal audit, certification, or a guarantee of POPIA compliance.</p><p><a href="https://lindeka.co.za/" style="color:#8bea24">Return to Lindeka website</a></p></main></body></html>`, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=UTF-8" }
        });
    } catch (error) {
        console.error("Checklist processing error:", error);
        return new Response("There was a problem processing your request. Please try again.", { status: 500, headers: textHeaders });
    }
}
