# FilmLabs

FilmLabs is a modern, full-stack, locally hosted entertainment platform. It leverages third-party streaming APIs to let you watch movies and TV shows without storing any media files locally. 

## ✨ Features

* **Streaming Integration**: Watch Movies and TV Shows seamlessly.
* **User Accounts**: Create accounts and login securely.
* **Personalized Library**: Account favoriting for Movies and TV Shows.
* **Watch History**: Keep track of what you've watched, including specific TV episodes.
* **Advanced Discovery**: Home page showcasing popular, trending, and new releases.
* **Robust Search**: Search with advanced filters including Media Type, Release Year, Age Rating, Minimum Score, and Genres.
* **Pagination**: Infinite "Load More" functionality for browsing large catalogs smoothly.

## 🛠️ Technical Stack

* **Framework**: Next.js 15 (App Router)
* **Database**: Prisma ORM (MySQL / PostgreSQL compatible)
* **Authentication**: NextAuth.js
* **Styling**: Tailwind CSS & shadcn/ui
* **Data Provider**: TMDB API

## 🚀 Installation Instructions

### 1. Clone the repository
```bash
git clone [https://github.com/Monnapse/FilmLabs.git](https://github.com/Monnapse/FilmLabs.git)
cd FilmLabs/filmlabs
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add the following variables:
```env
# Database connection string (e.g., MySQL or PostgreSQL)
# Example: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:password@localhost:3306/filmlabs"

# NextAuth Secret (Generate one using `openssl rand -base64 32` in your terminal)
NEXTAUTH_SECRET="your_randomly_generated_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# TMDB API Key (Get from [https://developer.themoviedb.org/docs/getting-started](https://developer.themoviedb.org/docs/getting-started))
TMDB_API_KEY="your_tmdb_api_key_here"
```

### 4. Setup the Database
```bash
npx prisma db push
npx prisma generate  
```

### 5. Run the Development Server
```bash
npm run dev
```

### 6. Access the Application
Open http://localhost:3000 with your browser to see the app running.

## Notes
* **Modifying Streaming APIs**: Update the services array in src/lib/videoServices.ts to add or remove embed providers.
* **Database Management**: You can view and manage your database easily by running npx prisma studio.