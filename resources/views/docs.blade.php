<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>توثيق Zool-AI API</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;700&display=swap');
        body { font-family: 'Cairo', sans-serif; background-color: #f8f9fa; line-height: 1.8; }
        .sidebar { background: #2c3e50; color: white; min-height: 100vh; padding: 20px; }
        .sidebar a { color: #ecf0f1; text-decoration: none; display: block; padding: 10px; border-radius: 5px; }
        .sidebar a:hover { background: #34495e; }
        .content { padding: 40px; }
        .card { border: none; box-shadow: 0 2px 15px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .endpoint { background: #eef2f7; padding: 10px; border-radius: 5px; font-family: monospace; font-weight: bold; margin-bottom: 15px; }
        .method { background: #007bff; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8em; margin-left: 10px; }
        pre { border-radius: 8px !important; }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <nav class="col-md-3 col-lg-2 sidebar d-none d-md-block">
                <h4 class="mb-4">Zool-AI API</h4>
                <a href="#intro">مقدمة</a>
                <a href="#auth">المصادقة</a>
                <a href="#chat">توليد النصوص</a>
                <a href="#image">توليد الصور</a>
                <a href="#video">توليد الفيديو</a>
                <a href="#audio">توليد الصوت</a>
                <a href="#examples">أمثلة برمجية</a>
            </nav>
            <main class="col-md-9 col-lg-10 content">
                <section id="intro">
                    <h1>توثيق واجهة البرمجة Zool-AI</h1>
                    <p class="lead">مرحباً بك في توثيق Zool-AI API، الواجهة المتكاملة لطلبات الذكاء الاصطناعي (نصوص، صور، فيديو، وصوت).</p>
                    <div class="alert alert-info">الـ API متوافق تماماً مع بنية OpenAI.</div>
                </section>

                <hr>

                <section id="auth">
                    <h3>المصادقة (Authentication)</h3>
                    <p>يجب إرسال مفتاح الـ API في ترويسة الطلب (Header) تحت اسم <code>x-api-key</code> أو كـ <code>Bearer Token</code>.</p>
                    <div class="endpoint">Authorization: Bearer YOUR_API_KEY</div>
                </section>

                <hr>

                <section id="chat">
                    <h3>توليد النصوص (Chat Completions)</h3>
                    <div class="endpoint"><span class="method">POST</span> /api/v1/chat</div>
                    <h5>البايلود (JSON):</h5>
                    <pre><code class="language-json">{
    "model": "openai",
    "session": "unique_session_id",
    "messages": [
        {"role": "user", "content": "مرحباً زولاي، كيف حالك؟"}
    ],
    "source": "zoolai"
}</code></pre>
                    <p><strong>ملاحظة:</strong> يتم حفظ سياق المحادثة تلقائياً لمدة 5 دقائق لكل <code>session</code>.</p>
                </section>

                <hr>

                <section id="image">
                    <h3>توليد الصور (Image Generation)</h3>
                    <div class="endpoint"><span class="method">POST</span> /api/v1/image</div>
                    <h5>البايلود (JSON):</h5>
                    <pre><code class="language-json">{
    "prompt": "رائد فضاء يركب جملاً في المريخ",
    "width": 1024,
    "height": 1024
}</code></pre>
                </section>

                <hr>

                <section id="examples">
                    <h3>أمثلة برمجية</h3>

                    <ul class="nav nav-tabs" id="codeTabs" role="tablist">
                        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#curl">cURL</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#python">Python</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#js">JavaScript</button></li>
                    </ul>
                    <div class="tab-content p-3 border border-top-0 bg-white">
                        <div class="tab-pane fade show active" id="curl">
                            <pre><code class="language-bash">curl -X POST https://your-domain.com/api/v1/chat \
-H "Content-Type: application/json" \
-H "x-api-key: YOUR_API_KEY" \
-d '{
    "model": "openai",
    "session": "sess_123",
    "messages": [{"role": "user", "content": "مرحباً"}]
}'</code></pre>
                        </div>
                        <div class="tab-pane fade" id="python">
                            <pre><code class="language-python">import requests

url = "https://your-domain.com/api/v1/chat"
headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model": "openai",
    "session": "sess_123",
    "messages": [{"role": "user", "content": "مرحباً"}]
}

response = requests.post(url, json=data, headers=headers)
print(response.json())</code></pre>
                        </div>
                        <div class="tab-pane fade" id="js">
                            <pre><code class="language-javascript">fetch('https://your-domain.com/api/v1/chat', {
    method: 'POST',
    headers: {
        'x-api-key': 'YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'openai',
        session: 'sess_123',
        messages: [{role: 'user', content: 'مرحباً'}]
    })
})
.then(res => res.json())
.then(data => console.log(data));</code></pre>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
</body>
</html>
