/**
 * Type definitions for klaviyo-node
 */

declare module 'klaviyo-node' {
  export default class Klaviyo {
    constructor(apiKey: string);
    
    public track(event: {
      event: string;
      customer_properties: Record<string, any>;
      properties?: Record<string, any>;
    }): Promise<any>;
    
    public identify(properties: {
      id?: string;
      email?: string;
      phone_number?: string;
      properties?: Record<string, any>;
    }): Promise<any>;
    
    // Add other method signatures as needed
  }
} 