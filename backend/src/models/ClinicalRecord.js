const mongoose = require('mongoose');

const ClinicalRecordSchema = new mongoose.Schema({
  // Reference to Patient
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  
  // Visit Information
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
    default: Date.now
  },
  
  // Clinical Assessment
  chiefComplaint: {
    type: String,
    required: [true, 'Chief complaint is required'],
    trim: true
  },
  
  // Physical Assessment
  physicalAssessment: {
    bodyPosture: {
      type: String,
      trim: true
    },
    rangeOfMotion: {
      type: String,
      trim: true
    },
    muscleStrength: {
      type: String,
      trim: true
    },
    painAssessment: {
      location: {
        type: String,
        trim: true
      },
      intensity: {
        type: Number,
        min: 0,
        max: 10
      },
      description: {
        type: String,
        trim: true
      }
    },
    functionalLimitations: {
      type: String,
      trim: true
    }
  },
  
  // Diagnosis and Plan
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  
  treatmentPlan: {
    shortTermGoals: [
      {
        type: String,
        trim: true
      }
    ],
    longTermGoals: [
      {
        type: String,
        trim: true
      }
    ],
    recommendedTreatments: [
      {
        type: String,
        trim: true
      }
    ],
    recommendedFrequency: {
      type: String,
      trim: true
    },
    estimatedDuration: {
      type: String,
      trim: true
    }
  },
  
  // Treatment Session
  treatmentProvided: {
    type: String,
    required: [true, 'Treatment provided is required'],
    trim: true
  },
  
  techniques: [
    {
      name: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      duration: {
        type: Number,
        min: 0
      }
    }
  ],
  
  homeExercises: [
    {
      name: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      frequency: {
        type: String,
        trim: true
      },
      sets: {
        type: Number
      },
      reps: {
        type: Number
      }
    }
  ],
  
  // Progress Information
  progressNotes: {
    type: String,
    trim: true
  },
  
  painBeforeTreatment: {
    type: Number,
    min: 0,
    max: 10
  },
  
  painAfterTreatment: {
    type: Number,
    min: 0,
    max: 10
  },
  
  functionalImprovements: {
    type: String,
    trim: true
  },
  
  // Professional Information
  practitioner: {
    type: String,
    required: [true, 'Practitioner name is required'],
    trim: true
  },
  
  nextVisitRecommendation: {
    type: Date
  },
  
  // Additional Information
  attachments: [
    {
      name: {
        type: String,
        trim: true
      },
      fileUrl: {
        type: String,
        trim: true
      },
      fileType: {
        type: String,
        trim: true
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  
  notes: {
    type: String,
    trim: true
  }
}, 
{
  timestamps: true
});

module.exports = mongoose.model('ClinicalRecord', ClinicalRecordSchema);

