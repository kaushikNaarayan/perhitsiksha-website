import { z } from 'zod';

// Define the environment schema
const environmentSchema = z.object({
  VITE_COUNTER_WORKSPACE: z.string().min(1, 'Counter workspace is required'),
  VITE_GA_MEASUREMENT_ID: z.string().optional(),
  VITE_ENVIRONMENT: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  VITE_API_BASE_URL: z.string().url().default('https://api.counterapi.dev/v2'),
  VITE_COUNTER_BASE_COUNT: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : undefined))
    .refine(val => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'Base count must be a non-negative number',
    }),
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

// Environment-specific base counts
const getBaseCount = (): number => {
  if (env.VITE_COUNTER_BASE_COUNT !== undefined) {
    return env.VITE_COUNTER_BASE_COUNT;
  }

  // Environment-specific defaults
  switch (env.VITE_ENVIRONMENT) {
    case 'production':
      return 350; // Historical count for production
    case 'staging':
      return 100; // Lower base for staging
    case 'development':
      return 10; // Minimal base for development
    default:
      return 0;
  }
};

// Environment-specific configurations
export const config = {
  counter: {
    workspace: env.VITE_COUNTER_WORKSPACE,
    baseUrl: env.VITE_API_BASE_URL,
    baseCount: getBaseCount(),
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
