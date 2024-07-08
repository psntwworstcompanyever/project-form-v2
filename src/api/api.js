const API_URL = import.meta.env.VITE_API_URL;

// Fetch functions
export const fetchPCBAList = async (list) => {
    try {
      const response = await fetch(`${API_URL}/pcba-list/get`);
      list.value = await response.json(); // Updated to .value
    } catch (error) {
      console.error('Failed to fetch PCBA list:', error);
    }
  };
export const fetchCustomerList = async (list) => {
    try {
      const response = await fetch(`${API_URL}/customer-list/get`);
      list.value = await response.json(); // Updated to .value
    } catch (error) {
      console.error('Failed to fetch customer list:', error);
    }
  }; 

  export const fetchHardwareSettings = async (pcba_sn, list) => {
    try {
      const response = await fetch(`${API_URL}/hardware-settings/pcba/${pcba_sn}`);
      list.value = await response.json(); // Updated to .value
    } catch (error) {
      console.error('Failed to fetch hardware settings:', error);
    }
  };

export const fetchSoftwareSettings = async (list) => {
    try {
      const response = await fetch(`${API_URL}/software-settings/specifications`);
      list.value = await response.json(); // Updated to .value
      return list.value // Return value for use
    } catch (error) {
      console.error('Failed to fetch software settings:', error);
    }
  };
  
export const fetchCustomerSettings = async (customer, list) => {
    try {
      const response = await fetch(`${API_URL}/customer-settings/customer/${customer}`);
      list.value = await response.json(); // Updated to .value
    } catch (error) {
      console.error('Failed to fetch customer settings:', error);
    }
  };

  export const fetchEmailSettings = async (list) => {
    try {
      const response = await fetch(`${API_URL}/email-settings/`);
      list.value = await response.json(); // Updated to .value
    } catch (error) {
      console.error('Failed to fetch email settings:', error);
    }
  };

  export const fetchNote = async (spec, customer, list) => {
    try {
        const response = await fetch(`${API_URL}/note/get?spec=${spec}&customer=${customer}`);
        list.value = await response.json(); // Updated to .value
    } catch (error) {
        console.error('Failed to fetch note:', error);
    }
};