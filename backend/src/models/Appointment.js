const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  // Reference to Patient
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  
  // Appointment Details
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    trim: true
  },
  
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    trim: true
  },
  
  // Optional reference to an existing clinical record
  clinicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClinicalRecord'
  },
  
  // Appointment Type and Status
  type: {
    type: String,
    enum: [
      'Initial Assessment',
      'Follow-up',
      'Treatment Session',
      'Progress Evaluation',
      'Discharge Assessment',
      'Other'
    ],
    required: [true, 'Appointment type is required']
  },
  
  status: {
    type: String,
    enum: [
      'Scheduled',
      'Confirmed',
      'Completed',
      'Cancelled',
      'No-Show',
      'Rescheduled'
    ],
    default: 'Scheduled'
  },
  
  // Cancellation Information
  cancellationReason: {
    type: String,
    trim: true
  },
  
  cancelledAt: {
    type: Date
  },
  
  cancelledBy: {
    type: String,
    trim: true
  },
  
  // Practitioner Information
  practitioner: {
    type: String,
    required: [true, 'Practitioner name is required'],
    trim: true
  },
  
  // Room/Resource Allocation
  room: {
    type: String,
    trim: true
  },
  
  // Payment and Insurance
  insuranceUsed: {
    type: Boolean,
    default: false
  },
  
  insuranceDetails: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    authorizationCode: {
      type: String,
      trim: true
    }
  },
  
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Partially Paid', 'Insurance Pending', 'Waived'],
    default: 'Pending'
  },
  
  fee: {
    type: Number,
    min: 0
  },
  
  // Communication
  reminderSent: {
    type: Boolean,
    default: false
  },
  
  reminderSentAt: {
    type: Date
  },
  
  // Notes
  appointmentNotes: {
    type: String,
    trim: true
  },
  
  followUpNeeded: {
    type: Boolean,
    default: false
  }
}, 
{
  timestamps: true
});

// Method to check for appointment conflicts
AppointmentSchema.statics.checkConflict = async function(practitioner, date, startTime, endTime, excludeId = null) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const query = {
    practitioner,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['Cancelled', 'No-Show'] }
  };
  
  // Exclude the current appointment if updating
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const appointments = await this.find(query);
  
  // Convert times to comparable format (assuming HH:MM format)
  const newStart = startTime;
  const newEnd = endTime;
  
  // Check for conflicts
  for (const app of appointments) {
    const existingStart = app.startTime;
    const existingEnd = app.endTime;
    
    // Check if new appointment overlaps with existing appointment
    if (
      (newStart >= existingStart && newStart < existingEnd) || // New start time is within existing appointment
      (newEnd > existingStart && newEnd <= existingEnd) || // New end time is within existing appointment
      (newStart <= existingStart && newEnd >= existingEnd) // New appointment completely overlaps existing appointment
    ) {
      return true; // Conflict found
    }
  }
  
  return false; // No conflict
};

module.exports = mongoose.model('Appointment', AppointmentSchema);

