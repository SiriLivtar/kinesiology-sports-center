const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    unique: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  
  // Contact Information
  email: {
    type: String,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'Chile',
      trim: true
    }
  },
  
  // Health Information
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  allergies: [
    {
      type: String,
      trim: true
    }
  ],
  medicalConditions: [
    {
      type: String,
      trim: true
    }
  ],
  medications: [
    {
      name: {
        type: String,
        trim: true
      },
      dosage: {
        type: String,
        trim: true
      },
      frequency: {
        type: String,
        trim: true
      }
    }
  ],
  
  // Additional Fields
  occupation: {
    type: String,
    trim: true
  },
  referredBy: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Status and Admin Fields
  isActive: {
    type: Boolean,
    default: true
  }
}, 
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for patient's full name
PatientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for patient's age
PatientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model('Patient', PatientSchema);

