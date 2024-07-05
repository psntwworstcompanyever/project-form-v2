<script setup>
import { FormKitSchema } from "@formkit/vue";
import { ref, onMounted } from 'vue';
import { getNode, createNode } from '@formkit/core';
import { fetchPCBAList, fetchCustomerList, fetchHardwareSettings, fetchSoftwareSettings, fetchCustomerSettings, fetchNote } from './api/api';

const API_URL = import.meta.env.VITE_API_URL;

const pcba_list = ref([]);
const customer_list = ref([]);
const hardware_settings = ref([]);
const software_settings = ref([]);
const customer_settings = ref({});
const note_list = ref([]);

const isPopupVisible = ref(false);
const popupCard = ref([
  {
    $el: 'h2',
    id: 'title',
    children: ['Note']
  },
  {
    $el: 'p',
    id: 'spec',
    children: ['Specification:']
  },
  {
    $el: 'p',
    id: 'illustration',
    children: ['Illustration:']
  },
  {
    $el: 'p',
    id: 'selected_item',
    children: ['Selected Item:']
  },
  {
    $el: 'p',
    id: 'customer',
    children: ['Customer:']
  },
  {
    $el: 'p',
    id: 'customer_setting',
    children: ['Customer Setting:']
  },
  {
    $el: 'p',
    id: 'recommendation',
    children: ['Recommendation:']
  }
]);

const data = ref({
  validationRules: { validation_function },
});

// Data Fetch Function
const fetchData = async () => {
  await fetchPCBAList(pcba_list);
  await fetchCustomerList(customer_list);
  await fetchCustomerSettings('Default', customer_settings); // Seems that customer_settings has to be fetched before software_settings
  await fetchHardwareSettings('1AXX-00A', hardware_settings);
  await fetchSoftwareSettings(software_settings);

  software_settings.value = reconstructFunctions(software_settings.value);
  hardware_settings.value = reconstructFunctions(hardware_settings.value);
};

fetchData().catch(error => {
  console.error('Error fetching data:', error);
});

// Reconstruct Function
const reconstructFunctions = (schema) => {
  // Helper function to recursively update the children array
  const updateChildren = (children) => {
    return children.map(child => {
      if (child.$formkit === 'select') {
        return { ...child, onPrefixIconClick: () => handleIconClick(child.id) };
      }
      return child;
    });
  };

  // Main function to iterate over the schema
  return schema.map(item => {
    if (item.$el === 'div' && Array.isArray(item.children)) {
      return {
        ...item,
        children: updateChildren(item.children)
      };
    }
    return item;
  });
};

// Validation Function
function validation_function(node) {
  const user_setting = node.value;
  const customer_setting = customer_settings.value[node.name];
  if (user_setting === customer_setting) {
    node.props.suffixIcon = ""; // If it is correct, show nothing.
    return true;
  }
  node.props.suffixIcon = "warning";
  return true;
}

// Icon Click Handler
const handleIconClick = async (dropdownName) => {

  // Get the clicked node
  const clickedNode = getNode(dropdownName);
  const selectedSpec = clickedNode.props.id;
  const selectedLabel = clickedNode.props.label;
  const selectedOption = clickedNode.value;

  // Get the customer node
  const customerNode = getNode('customer');
  const selectedCustomer = customerNode.value;

  // Get the customer setting
  const customerSetting = customer_settings.value[clickedNode.props.id];

  // Fetch note
  await fetchNote(selectedSpec, selectedCustomer, note_list)

  // Update the pop up card
  updatePopupCard(selectedLabel, selectedOption, selectedCustomer, customerSetting, note_list)
  isPopupVisible.value = true; // Show the popup
};

// Update pop card function
const updatePopupCard = (selectedLabel, selectedOption, selectedCustomer, customerSetting, note_list) => {
  const updates = {
    'spec': `Specification: ${selectedLabel}`,
    'illustration': `Illustration: ${note_list.value[0].illustration}`,
    'selected_item': `Selected Item: ${selectedOption}`,
    'customer': `Customer: ${selectedCustomer}`,
    'customer_setting': `Customer Setting: ${customerSetting}`,
    'recommendation': `Recommendation: ${note_list.value[1].recommendation}`
  };

  popupCard.value = popupCard.value.map(item => {
    if (updates[item.id]) {
      return { ...item, children: [updates[item.id]] };
    }
    return item;
  });
};

// Form Submit Function
const handleSubmit = async () => {
  const pcbaNode = getNode('pcba');
  const customerNode = getNode('customer');
  const hardwareNode = getNode('hardware');
  const softwareNode = getNode('software');

  const postData = {
    pcba: pcbaNode.value,
    customer: customerNode.value,
    hardware: hardwareNode.value,
    software: softwareNode.value
  };

  try {

    const response = await fetch(`${API_URL}/create-project/submit`, {  // Change the URL to your actual endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error during the POST request:', error);
  }
};

// We add it inside a onMounted to make sure the node exists
onMounted(() => {
  // Use the IDs of the inputs you want to get, for our case the class and the attributes group
  const pcbaNode = getNode('pcba');
  const customerNode = getNode('customer');
  const softwareNode = getNode('software');

  // If pcba is changed, update hardware_settings.
  pcbaNode.on('commit', async ({ payload }) => {
    await fetchHardwareSettings(payload, hardware_settings);
  });

  // If customer is changed, update customer_settings.
  customerNode.on('commit', async ({ payload }) => {
    await fetchCustomerSettings(payload, customer_settings);
    const deepCopy = JSON.parse(JSON.stringify(customer_settings.value)); // To avoid reference bettwen two arrays.
    softwareNode.input(deepCopy);
  });
});
</script>

<template>
  <FormKit type="form" @submit="handleSubmit">
    <FormKit type="select" name="pcba" id="pcba" label="PCBA" :options="pcba_list" />
    <FormKit type="select" name="customer" id="customer" label="Customer" :options="customer_list" value="Default" />
    <FormKit type="group" name="hardware" id="hardware">
      <FormKitSchema :schema="hardware_settings" />
    </FormKit>
    <FormKit type="group" name="software" id="software">
      <FormKitSchema :schema="software_settings" :data="data" />
    </FormKit>
  </FormKit>

  <div v-if="isPopupVisible" class="popup">
    <FormKit type="group" name="popcard" id="popcard">
      <FormKitSchema :schema="popupCard" />
      <button @click="isPopupVisible = false">Close</button>
    </FormKit>
  </div>

  <pre>
    {{ customer_settings }}
  </pre>

</template>

<style>
.formkit-prefix-icon.formkit-icon svg {
  width: 16px;
  height: 16px;
}

.formkit-suffix-icon.formkit-icon svg {
  width: 16px;
  height: 16px;
  color: red;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  z-index: 1000;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>