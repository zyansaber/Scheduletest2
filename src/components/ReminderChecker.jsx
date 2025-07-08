import { useEffect } from 'react';
import { checkReminders } from '../utils/firebase';
import emailjs from '@emailjs/browser';

const ReminderChecker = ({ data }) => {
  useEffect(() => {
    const checkAndSendReminders = async () => {
      if (!data || data.length === 0) return;

      try {
        // Check for reminders that need to be sent
        const remindersToSend = await checkReminders(data);
        
        // Send emails for each reminder that needs to be sent
        for (const reminder of remindersToSend) {
          await emailjs.send(
            'service_zjcpaps',
            'template_barjtqgp',
            {
              from_name: 'Schedule Dashboard',
              to_email: reminder.email,
              message: `The production stage for chassis ${reminder.chassis} has changed from "${reminder.productionStage}" to "${reminder.newStage}".`,
              selected_chassis: reminder.chassis,
              chassis_count: 1,
            },
            'rAEsoMfySq9l5mXvz' // EmailJS public key
          );
          
          console.log(`Reminder email sent for chassis ${reminder.chassis} to ${reminder.email}`);
        }
      } catch (error) {
        console.error('Error in reminder checker:', error);
      }
    };

    // Run the check when data changes
    checkAndSendReminders();
  }, [data]);

  // This is a utility component that doesn't render anything
  return null;
};

export default ReminderChecker;