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
    
    // Add the lists property with its methods
    public lists: {
      addSubscribersToList(options: {
        listId: string;
        profiles: Array<{
          email?: string;
          phone_number?: string;
          first_name?: string;
          last_name?: string;
          [key: string]: any;
        }>;
      }): Promise<any>;
      
      // Add other list-related methods as needed
      getSubscribers(options: { listId: string }): Promise<any>;
      removeSubscribersFromList(options: { listId: string; emails: string[] }): Promise<any>;
    };
    
    // Add other method signatures as needed
  }
} 