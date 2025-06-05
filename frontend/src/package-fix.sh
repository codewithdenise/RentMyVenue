#!/bin/bash

# Install peer dependencies to ensure compatible versions
npm install react@18.3.1 react-dom@18.3.1 @types/react@18.3.3 @types/react-dom@18.3.0 --save-exact

# Clear vite cache
rm -rf node_modules/.vite

# Reinstall specific package
npm install @tanstack/react-query@5.56.2 --save-exact

# Run development server
npm run dev
