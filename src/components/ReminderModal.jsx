import React, { useState, useMemo } from 'react';
import { addReminder } from '../utils/firebase';
import emailjs from '@emailjs/browser';

// Add your EmailJS reminder template ID here
const REMINDER_TEMPLATE_ID = 'template_reminder123'; // Update this with your actual template ID

const ReminderModal = ({ isOpen, onClose, selectedChassis, chassisData }) => {
  const [email, setEmail] = useState('');
  const [chassis, setChassis] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReminders, setSelectedReminders] = useState([]);
  const [reminderNote, setReminderNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  // Initialize selectedReminders with any pre-selected chassis
  React.useEffect(() => {
    if (selectedChassis && selectedChassis.length > 0) {
      setSelectedReminders(selectedChassis);
    }
  }, [selectedChassis]);

  // Optimize by using useMemo to filter chassis data
  const availableChassisData = useMemo(() => {
    if (!chassisData) return [];
    return chassisData.filter(item => item.Chassis).slice(0, 50); // Limit for performance
  }, [chassisData]);

  // Selected chassis details for display
  const selectedChassisData = useMemo(() => {
    if (!chassisData || selectedReminders.length === 0) return [];
    
    return chassisData.filter(item => 
      item.Chassis && selectedReminders.includes(item.Chassis)
    );
  }, [chassisData, selectedReminders]);

  // Handle chassis selection (with event propagation control)
  const handleSelectChassis = (chassis, event) => {
    // Prevent the click from bubbling to parent elements
    if (event) {
      event.stopPropagation();
    }
    
    if (selectedReminders.includes(chassis)) {
      setSelectedReminders(prev => prev.filter(item => item !== chassis));
    } else {
      setSelectedReminders(prev => [...prev, chassis]);
    }
  };

  // Add manually entered chassis
  const handleAddManualChassis = () => {
    if (!chassis || chassis.trim() === '') return;
    if (!selectedReminders.includes(chassis)) {
      setSelectedReminders(prev => [...prev, chassis]);
    }
    setChassis('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    if (selectedReminders.length === 0) {
      setError('Please select at least one chassis');
      return;
    }

    if (!reminderDate) {
      setError('Please select a reminder date');
      return;
    }

    if (!reminderNote) {
      setError('Please enter a reminder note');
      return;
    }
    
    setSending(true);
    setError(null);
    
    try {
      // Process each selected chassis
      const promises = selectedReminders.map(async chassisId => {
        try {
          // Find chassis details from data
          const chassisDetails = chassisData.find(item => item.Chassis === chassisId) || { Chassis: chassisId };
          
          // Add reminder to Firebase
          const result = await addReminder({
            chassis: chassisId,
            chassisDetails,
            date: reminderDate,
            note: reminderNote,
            notificationType: 'email',
            emailTo: email
          });
          
          // Try to send email notification using EmailJS
          try {
            await emailjs.send(
              'service_zjcpaps', // Replace with your service ID
              REMINDER_TEMPLATE_ID,
              {
                from_name: 'Schedule Dashboard',
                to_email: email,
                chassis: chassisId,
                note: reminderNote,
                date: reminderDate,
                model: chassisDetails.Model || 'N/A',
                customer: chassisDetails.Customer || 'N/A'
              },
              'rAEsoMfySq9l5mXvz' // Replace with your user ID
            );
          } catch (emailError) {
            console.warn('Email notification failed but reminder was set:', emailError);
          }
          
          return { chassisId, success: result.success };
        } catch (err) {
          console.error(`Error processing chassis ${chassisId}:`, err);
          return { chassisId, success: false, error: err.message };
        }
      });
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount === selectedReminders.length) {
        setSuccess(true);
        // Reset form
        setSelectedReminders([]);
        setChassis('');
        setEmail('');
        setReminderDate('');
        setReminderNote('');
        // Auto-close after success
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        const failedChassis = results
          .filter(r => !r.success)
          .map(r => r.chassisId)
          .join(', ');
        setError(`Failed to set reminders for: ${failedChassis}`);
      }
    } catch (err) {
      console.error('Error setting reminders:', err);
      setError('Failed to set reminders: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Set Production Stage Reminder</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Main form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Enter email to receive notifications"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded p-2"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Note
            </label>
            <textarea
              className="w-full border border-gray-300 rounded p-2 h-24"
              placeholder="Enter reminder details"
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Chassis Manually
            </label>
            <div className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-l p-2"
                placeholder="Enter chassis ID"
                value={chassis}
                onChange={(e) => setChassis(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualChassis();
                  }
                }}
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-r"
                onClick={handleAddManualChassis}
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected chassis display */}
          {selectedChassisData.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Selected Chassis ({selectedChassisData.length}):
              </h3>
              <div className="max-h-40 overflow-y-auto p-2 bg-gray-50 rounded">
                {selectedChassisData.map(item => (
                  <div key={item.Chassis} className="text-sm text-gray-600 flex justify-between items-center py-1">
                    <span>{item.Chassis}</span>
                    <span className="text-gray-500">
                      {item["Regent Production"] || "No Stage"}
                    </span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleSelectChassis(item.Chassis)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available chassis selection */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select Chassis:
            </h3>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-16 px-3 py-2 text-xs font-medium text-gray-500 text-left">
                      Select
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">
                      Chassis
                    </th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 text-left">
                      Stage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {availableChassisData.map((item) => (
                    <tr 
                      key={item.Chassis}
                      className={`hover:bg-gray-100 cursor-pointer ${
                        selectedReminders.includes(item.Chassis) ? 'bg-blue-50' : ''
                      }`}
                      onClick={(e) => handleSelectChassis(item.Chassis, e)}
                    >
                      <td className="px-3 py-2 border-b">
                        <input 
                          type="checkbox" 
                          checked={selectedReminders.includes(item.Chassis)}
                          onChange={(e) => handleSelectChassis(item.Chassis, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm border-b">
                        {item.Chassis}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500 border-b">
                        {item["Regent Production"] || "No Stage"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error and success messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded">
              Reminders set successfully!
            </div>
          )}
          
          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={sending}
            >
              {sending ? "Setting reminders..." : "Set Reminders"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;