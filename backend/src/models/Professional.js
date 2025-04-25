const mongoose = require('mongoose');

const ProfessionalSchema = new mongoose.Schema({
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
  especialty: {
    type: String,
    required: [true, 'Especialty is required'],
    trim: true
  },
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
  isActive: {
    type: Boolean,
    default: true
  }},
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  // Virtual for patient's full name
  ProfessionalSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
  });

  // Virtual for patient's age
  ProfessionalSchema.virtual('age').get(function() {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  });

  module.exports = mongoose.model('Profesional', ProfessionalSchema);