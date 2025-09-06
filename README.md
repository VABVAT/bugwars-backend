Project Setup Guide
-------------------

# Requirements
1. Node.js
2. npm
3. Access to the cloud database

# Installation

1. Clone the repository:
   git clone <repository-url>
   cd <project-directory>

2. Install dependencies:
   npm i

3. Set up environment variables:
   - Contact the project maintainer for .env variables
   - Create a .env file in the root directory with the provided variables

4. Set up the database:
   - Pull the latest schema from the cloud database:
     prisma db pull
   - Generate Prisma client with the latest configuration:
     prisma generate

5. Run the application locally:
   node index.js

# Development Workflow
- Never push directly to the main branch.
- Create a separate branch for your changes:
  git checkout -b feature/your-feature-name
- Make your changes and commit them.
- Push your branch and create a pull request.
- Contact the maintainer if you have any doubts or questions.

# Contact
For environment variables, questions, or any development concerns, please contact the project maintainer.

# Tech Stack
- Node.js
- Prisma ORM
