# 🌿 LofiVibes

Immerse yourself in a world of relaxing lofi music and chill beats. LofiVibes is your perfect companion for studying, working, or just unwinding.

![LofiVibes Banner](public/banner.png)

## ✨ Features

-   🎵 Curated collection of lofi music
-   🎨 Beautiful, minimalist interface
-   🌙 Dark/Light mode
-   ⏯️ Seamless playback controls
-   📱 Fully responsive design
-   🔥 Real-time music visualization
-   💾 Offline playback support
-   🎨 Customizable themes

## 🛠️ Tech Stack

-   **Frontend Framework:** Next.js 15 (React)
-   **Language:** TypeScript
-   **Styling:** TailwindCSS
-   **UI Components:** shadcn/ui
-   **State Management:** Zustand
-   **Audio Processing:** Howler.js
-   **Animations:** Framer Motion
-   **Database:** Supabase
-   **Deployment:** Vercel

## 📦 Prerequisites

-   Node.js (v18.17 or higher)
-   pnpm (v8.0 or higher)

## 🚀 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/hongducdev/lofivibes.git
cd lofivibes
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Project Structure

```
lofivibes/
├── app/              # Next.js app directory
├── components/       # Reusable UI components
├── lib/             # Utility functions and hooks
├── public/          # Static assets
├── styles/          # Global styles
└── types/           # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   Music provided by various lofi artists
-   Inspiration from [Lofi Girl](https://www.youtube.com/c/LofiGirl)
-   Icons from [Heroicons](https://heroicons.com/)

## 📞 Support

For support, please open an issue in the GitHub repository or contact us at support@lofivibes.com

---

Made with ❤️ by [Hong Duc Dev](https://hongduc.dev)
