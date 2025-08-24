# TaskWhisper 🚀

**Conversational AI-Powered Task Management with RAG**

TaskWhisper was built to solve one of the most common challenges in project management: when tasks multiply across team members, tracking them through dashboards or manual updates becomes inefficient and overwhelming.  

Our solution? A **conversational, AI-powered task management system** where you simply **chat with a smart assistant** to fetch details on tasks, progress, or assignments—instantly.  

> **Target Audience:** Enterprises, startups, and growing businesses seeking streamlined workflow management as complexity scales.  

👉 [Submission on Lablab.ai](https://lablab.ai/event/co-creating-with-gpt-5/novelty/taskwhisper)

---

## ✨ Features

- 💬 **Conversational Interface** – Query task progress and assignments through natural language  
- 🧠 **RAG-Powered Retrieval** – Get accurate, contextual responses from structured task data  
- 📂 **Multi-Project Support** – Create and manage multiple projects seamlessly  
- 👥 **Role & Member Assignment** – Assign tasks and roles directly through chat  
- 🚀 **Scalable** – Suitable for small teams or enterprise-level workflows  
- 🔮 **Future Roadmap** – Chat-driven project creation, property modification, and full workflow automation  

---

## 👥 Contributors
<table> <tr> <td align="center"> <a href="https://github.com/muhammadanas-x"> <img src="https://avatars.githubusercontent.com/u/111079610?v=4" width="110" height="110" style="border-radius: 50%;" alt="Muhammad Anas avatar"/> <br /> <sub><b>Muhammad Anas</b></sub> </a> <br /> <sub>@muhammadanas-x</sub> <br /> 💡 Creator & Lead Developer </td> </tr> </table>
<table> <tr> <td align="center"> <a href="https://github.com/arefham"> <img src="https://avatars.githubusercontent.com/u/56312801?v=4" width="110" height="110" style="border-radius: 50%;" alt="Aref Ham avatar"/> <br /> <sub><b>Aref Hammadi</b></sub> </a> <br /> <sub>@arefham</sub> <br /> 💡 AI Engineer </td> </tr> </table>

## 🏗️ Tech Stack

*(Adjust based on your repository files — below is a typical setup for RAG-based assistants)*  

- **Backend**: Python (FastAPI / Flask)  
- **AI Layer**: GPT-5 with Retrieval-Augmented Generation (LangChain, LlamaIndex, etc.)  
- **Vector Database**: Pinecone / FAISS / Weaviate  
- **Frontend**: Streamlit / React / CLI interface  
- **Deployment**: Docker + Cloud (AWS, GCP, or Heroku)  

---

## 📦 Installation

Clone and set up locally:


### Clone repository
```bash
git clone https://github.com/muhammadanas-x/Automate-tasks.git
```
```bash
cd Automate-tasks/lalala
```
### Create virtual environment
```bash
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Set up environment variables (.env file or export manually):
OPENAI_API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here

### Run the application:
python app.py
# or
uvicorn main:app --reload

## ⚡ Usage

Once running, you can chat with TaskWhisper to manage your projects. Examples:

### Task queries:
“Show all pending tasks for Project Alpha.”
“List tasks assigned to Jane Doe.”

### Progress tracking:
“Summarize this week’s updates by team members.”
“Which tasks are delayed and who is responsible?”

### Future workflows:
“Create a new project named Beta Launch with roles.”
“Reassign the backend optimization task to John.”

## 🤝 Contributing

We welcome contributions of all sizes.

### Fork the repo
Create a feature branch
```bash
git checkout -b feat/awesome-thing
```

Commit with context
```bash
git commit -m "feat: add awesome thing"
```

Push & open a PR 🎉

## <3 Dev notes:
Keep PRs focused and small when possible.
Add tests or example usage where it helps reviewers.
Document any environment variables / config changes.

## 🧭 Quick FAQ

Q: Can I use a different LLM or vector DB?
A: Yes—RAG is pluggable. Swap the model/provider and the retriever (Pinecone, FAISS, Weaviate, etc.).

Q: Does this require a dashboard?
A: No—that’s the point. You interact through chat. Dashboards are optional.

Q: Where do I add API keys?
A: Use .env.local (Next.js) and read via process.env. Never commit secrets.

<div align="center">

TaskWhisper turns project management into a conversation.
No dashboards. No hunting. Just ask—and know.

</div> ```
