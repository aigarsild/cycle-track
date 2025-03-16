import Klaviyo from 'klaviyo-node';

const klaviyoApiKey = process.env.KLAVIYO_API_KEY || '';
const klaviyoClient = new Klaviyo(klaviyoApiKey);

export const subscribeToNewsletter = async (email: string, name: string, phone: string) => {
  try {
    const response = await klaviyoClient.lists.addSubscribersToList({
      listId: process.env.KLAVIYO_LIST_ID || '',
      profiles: [
        {
          email,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' '),
          phone_number: phone,
          properties: {
            source: 'Bike Shop Service Form'
          }
        }
      ]
    });
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { success: false, error };
  }
};

export const sendServiceConfirmation = async (email: string, name: string, serviceDetails: any) => {
  try {
    const response = await klaviyoClient.track({
      event: 'Service Request Confirmation',
      customer_properties: {
        $email: email,
        $first_name: name.split(' ')[0],
        $last_name: name.split(' ').slice(1).join(' ')
      },
      properties: {
        ...serviceDetails,
        service_date: new Date().toISOString()
      }
    });
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending service confirmation:', error);
    return { success: false, error };
  }
}; 