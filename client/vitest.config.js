import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react({jsxRuntime:'automatic'})],test:{environment:'jsdom',restoreMocks:true,include:['src/**/*.test.{js,jsx}']}});
