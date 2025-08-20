import { z } from 'zod';

// Define the environment schema
const environmentSchema = z.object({
  VITE_COUNTER_WORKSPACE: z.string().min(1, 'Counter workspace is required'),
  VITE_GA_MEASUREMENT_ID: z.string().optional(),
  VITE_ENVIRONMENT: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  VITE_API_BASE_URL: z.string().url().default('https://api.counterapi.dev/v2'),
});

// Type inference from schema
export type Environment = z.infer<typeof environmentSchema>;

// Validate and parse environment variables
function validateEnvironment(): Environment {
  try {
    return environmentSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnvironment();

// Export utilities
export const isDevelopment = env.VITE_ENVIRONMENT === 'development';
export const isStaging = env.VITE_ENVIRONMENT === 'staging';
export const isProduction = env.VITE_ENVIRONMENT === 'production';

// Environment-specific configurations
export const config = {
  counter: {
    workspace: env.VITE_COUNTER_WORKSPACE,
    baseUrl: env.VITE_API_BASE_URL,
    baseCount: 350, // Historical count before counter implementation
  },
  analytics: {
    measurementId: env.VITE_GA_MEASUREMENT_ID,
    enabled: isProduction && !!env.VITE_GA_MEASUREMENT_ID,
  },
  app: {
    name: 'PerhitSiksha',
    environment: env.VITE_ENVIRONMENT,
    version: import.meta.env.PACKAGE_VERSION || '0.0.0',
  },
  features: {
    // Feature flags for different environments
    enableTestMode: isDevelopment || isStaging,
    enableDebugLogs: isDevelopment || isStaging,
    enablePerformanceMonitoring: isProduction,
  },
} as const;

// Development helpers
if (isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    environment: env.VITE_ENVIRONMENT,
    workspace: env.VITE_COUNTER_WORKSPACE,
    features: config.features,
  });
}
