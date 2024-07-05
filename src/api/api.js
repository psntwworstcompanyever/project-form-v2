// Fetch functions
export const fetchPCBAList = async (list) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/pcba-list/get');
      list.value = await response.json(); // Updated to .value
    } catch (error) {
      console.error('Failed to fetch PCBA list:', error);
    }
  };
export const fetchCustomerList = async (list) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/customer-list/get');
      list.value = await response.json(); // Updated to .value
    } catch (error) {
      console.error('Failed to fetch customer list:', error);
    }
  }; 

  export const fetchHardwareSettings = async (pcba_sn, list) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/hardware-settings/pcba/${pcba_sn}`);
      list.value = await response.json(); // Updated to .value
      return list.value; // Return value for use
    } catch (error) {
      console.error('Failed to fetch hardware settings:', error);
    }
  };

export const fetchSoftwareSettings = async (list) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/software-settings/specifications');
      list.value = await response.json(); // Updated to .value
      return list.value // Return value for use
    } catch (error) {
      console.error('Failed to fetch software settings:', error);
    }
  };
  
export const fetchCustomerSettings = async (customer, list) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/customer-settings/customer/${customer}`);
      list.value = await response.json(); // Updated to .value
      return list.value; // Return value for use
    } catch (error) {
      console.error('Failed to fetch customer settings:', error);
    }
  };

  export const fetchNote = async (spec, customer, list) => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/note/get?spec=${spec}&customer=${customer}`);
        list.value = await response.json(); // Updated to .value
        return list.value; // Return value for use
    } catch (error) {
        console.error('Failed to fetch note:', error);
    }
};