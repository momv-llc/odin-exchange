import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[]; // Optional weights for each variant, defaults to equal distribution
  active: boolean;
}

export interface ExperimentResult {
  experimentId: string;
  variant: string;
  assignedAt: Date;
}

interface ABTestingContextType {
  experiments: Record<string, ExperimentResult>;
  getVariant: (experimentId: string) => string | null;
  trackConversion: (experimentId: string, eventName: string, metadata?: Record<string, unknown>) => void;
  isLoading: boolean;
}

// Default experiments configuration
export const defaultExperiments: Experiment[] = [
  {
    id: 'exchange_form_layout',
    name: 'Exchange Form Layout Test',
    variants: ['control', 'compact', 'expanded'],
    weights: [0.34, 0.33, 0.33],
    active: true,
  },
  {
    id: 'cta_button_color',
    name: 'CTA Button Color Test',
    variants: ['emerald', 'blue', 'purple'],
    weights: [0.34, 0.33, 0.33],
    active: true,
  },
  {
    id: 'reviews_display',
    name: 'Reviews Display Test',
    variants: ['grid_3col', 'grid_2col', 'list'],
    weights: [0.34, 0.33, 0.33],
    active: true,
  },
  {
    id: 'hero_headline',
    name: 'Hero Headline Test',
    variants: ['buy_sell', 'exchange_crypto', 'trade_now'],
    active: true,
  },
  {
    id: 'support_chat_position',
    name: 'Support Chat Position Test',
    variants: ['bottom_right', 'bottom_left'],
    weights: [0.5, 0.5],
    active: true,
  },
];

// Storage key for persisting experiment assignments
const STORAGE_KEY = 'odin_ab_experiments';

// Context
const ABTestingContext = createContext<ABTestingContextType | null>(null);

// Helper function to generate consistent hash for user assignment
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Helper function to select variant based on weights
function selectVariant(
  experimentId: string,
  userId: string,
  variants: string[],
  weights?: number[]
): string {
  // Create a deterministic but seemingly random value based on experiment and user
  const seed = hashString(`${experimentId}:${userId}`);
  const random = (seed % 10000) / 10000; // Value between 0 and 1

  // If no weights provided, use equal distribution
  const actualWeights = weights || variants.map(() => 1 / variants.length);

  // Normalize weights to sum to 1
  const weightSum = actualWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = actualWeights.map(w => w / weightSum);

  // Select variant based on cumulative weights
  let cumulative = 0;
  for (let i = 0; i < variants.length; i++) {
    cumulative += normalizedWeights[i];
    if (random < cumulative) {
      return variants[i];
    }
  }

  return variants[variants.length - 1];
}

// Generate or retrieve user ID
function getUserId(): string {
  const storageKey = 'odin_user_id';
  let userId = localStorage.getItem(storageKey);

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, userId);
  }

  return userId;
}

// Provider Props
interface ABTestingProviderProps {
  children: ReactNode;
  experiments?: Experiment[];
  onConversion?: (experimentId: string, variant: string, eventName: string, metadata?: Record<string, unknown>) => void;
}

// Provider Component
export function ABTestingProvider({
  children,
  experiments = defaultExperiments,
  onConversion,
}: ABTestingProviderProps) {
  const [experimentResults, setExperimentResults] = useState<Record<string, ExperimentResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState(() => getUserId());

  // Initialize experiments on mount
  useEffect(() => {
    const initializeExperiments = () => {
      // Try to load existing assignments from storage
      const stored = localStorage.getItem(STORAGE_KEY);
      const existingAssignments: Record<string, ExperimentResult> = stored
        ? JSON.parse(stored)
        : {};

      const newAssignments: Record<string, ExperimentResult> = {};

      // Process each experiment
      experiments.forEach((experiment) => {
        if (!experiment.active) return;

        // Check if user already has an assignment for this experiment
        if (existingAssignments[experiment.id]) {
          // Verify the variant still exists
          const existingVariant = existingAssignments[experiment.id].variant;
          if (experiment.variants.includes(existingVariant)) {
            newAssignments[experiment.id] = existingAssignments[experiment.id];
            return;
          }
        }

        // Assign new variant
        const variant = selectVariant(
          experiment.id,
          userId,
          experiment.variants,
          experiment.weights
        );

        newAssignments[experiment.id] = {
          experimentId: experiment.id,
          variant,
          assignedAt: new Date(),
        };

        // Track experiment assignment
        console.log(`[A/B Testing] User assigned to experiment "${experiment.name}": ${variant}`);
      });

      // Save assignments to storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssignments));
      setExperimentResults(newAssignments);
      setIsLoading(false);
    };

    initializeExperiments();
  }, [experiments, userId]);

  // Get variant for an experiment
  const getVariant = (experimentId: string): string | null => {
    return experimentResults[experimentId]?.variant || null;
  };

  // Track conversion event
  const trackConversion = (
    experimentId: string,
    eventName: string,
    metadata?: Record<string, unknown>
  ) => {
    const result = experimentResults[experimentId];
    if (!result) {
      console.warn(`[A/B Testing] No experiment found with ID: ${experimentId}`);
      return;
    }

    // Log conversion
    console.log(`[A/B Testing] Conversion tracked:`, {
      experimentId,
      variant: result.variant,
      event: eventName,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Call external handler if provided
    if (onConversion) {
      onConversion(experimentId, result.variant, eventName, metadata);
    }

    // In production, you would send this to your analytics service
    // Example: sendToAnalytics({ experimentId, variant: result.variant, event: eventName, metadata });
  };

  const value: ABTestingContextType = {
    experiments: experimentResults,
    getVariant,
    trackConversion,
    isLoading,
  };

  return (
    <ABTestingContext.Provider value={value}>
      {children}
    </ABTestingContext.Provider>
  );
}

// Hook to use A/B testing
export function useABTesting() {
  const context = useContext(ABTestingContext);
  if (!context) {
    throw new Error('useABTesting must be used within an ABTestingProvider');
  }
  return context;
}

// Hook to get specific experiment variant
export function useExperiment(experimentId: string): { variant: string | null; isLoading: boolean } {
  const { getVariant, isLoading } = useABTesting();
  return {
    variant: getVariant(experimentId),
    isLoading,
  };
}

// Component for conditional rendering based on variant
interface ExperimentProps {
  id: string;
  children: ReactNode | ((variant: string | null) => ReactNode);
  fallback?: ReactNode;
}

export function Experiment({ id, children, fallback = null }: ExperimentProps) {
  const { variant, isLoading } = useExperiment(id);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (typeof children === 'function') {
    return <>{children(variant)}</>;
  }

  return <>{children}</>;
}

// Component for rendering specific variant
interface VariantProps {
  experimentId: string;
  variant: string;
  children: ReactNode;
}

export function Variant({ experimentId, variant, children }: VariantProps) {
  const { variant: activeVariant, isLoading } = useExperiment(experimentId);

  if (isLoading || activeVariant !== variant) {
    return null;
  }

  return <>{children}</>;
}

// Analytics helpers
export const ABAnalytics = {
  // Track page view with experiment context
  trackPageView: (pageName: string, experiments: Record<string, ExperimentResult>) => {
    console.log(`[A/B Analytics] Page view:`, {
      page: pageName,
      experiments: Object.entries(experiments).map(([id, result]) => ({
        id,
        variant: result.variant,
      })),
      timestamp: new Date().toISOString(),
    });
  },

  // Track button click
  trackClick: (elementId: string, experimentId?: string, variant?: string) => {
    console.log(`[A/B Analytics] Click:`, {
      element: elementId,
      experimentId,
      variant,
      timestamp: new Date().toISOString(),
    });
  },

  // Track form submission
  trackFormSubmission: (formId: string, success: boolean, experimentId?: string, variant?: string) => {
    console.log(`[A/B Analytics] Form submission:`, {
      form: formId,
      success,
      experimentId,
      variant,
      timestamp: new Date().toISOString(),
    });
  },

  // Track exchange completion
  trackExchangeComplete: (amount: number, fromCurrency: string, toCurrency: string, experimentId?: string, variant?: string) => {
    console.log(`[A/B Analytics] Exchange complete:`, {
      amount,
      fromCurrency,
      toCurrency,
      experimentId,
      variant,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export types
export type { ABTestingContextType, ExperimentResult };
