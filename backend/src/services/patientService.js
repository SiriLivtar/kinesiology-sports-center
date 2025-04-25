const Patient = require('../models/Patient');

/**
 * Service to handle patient-related operations
 */
class PatientService {
  /**
   * Create a new patient
   * @param {Object} patientData - Patient data to create
   * @returns {Promise<Object>} - Created patient object
   */
  async createPatient(patientData) {
    try {
      // Check if patient with same ID already exists
      const existingPatient = await Patient.findOne({ idNumber: patientData.idNumber });
      if (existingPatient) {
        const error = new Error('Patient with this ID number already exists');
        error.statusCode = 400;
        throw error;
      }

      // Create new patient
      const patient = await Patient.create(patientData);
      return patient;
    } catch (error) {
      // Add status code if not present
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  }

  /**
   * Get all patients with pagination
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 10)
   * @param {Object} options.filters - Filters to apply
   * @returns {Promise<Object>} - Paginated patients and metadata
   */
  async getAllPatients({ page = 1, limit = 10, filters = {} }) {
    try {
      // Convert page to number and ensure it's at least 1
      page = Math.max(1, parseInt(page));
      // Convert limit to number and ensure it's between 1 and 100
      limit = Math.min(100, Math.max(1, parseInt(limit)));
      
      // Build query with active patients by default
      const query = { ...filters, isActive: filters.isActive !== undefined ? filters.isActive : true };
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Execute query with pagination
      const patients = await Patient.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count of matching documents
      const totalPatients = await Patient.countDocuments(query);
      
      // Calculate total pages
      const totalPages = Math.ceil(totalPatients / limit);
      
      return {
        patients,
        pagination: {
          total: totalPatients,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Get a patient by ID
   * @param {string} patientId - MongoDB ID of the patient
   * @returns {Promise<Object>} - Patient object
   */
  async getPatientById(patientId) {
    try {
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        const error = new Error('Patient not found');
        error.statusCode = 404;
        throw error;
      }
      
      return patient;
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  }

  /**
   * Update a patient by ID
   * @param {string} patientId - MongoDB ID of the patient
   * @param {Object} updateData - Updated patient data
   * @returns {Promise<Object>} - Updated patient object
   */
  async updatePatient(patientId, updateData) {
    try {
      // Check if patient exists
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        const error = new Error('Patient not found');
        error.statusCode = 404;
        throw error;
      }
      
      // If ID number is being updated, check if it would conflict with another patient
      if (updateData.idNumber && updateData.idNumber !== patient.idNumber) {
        const existingPatient = await Patient.findOne({ 
          idNumber: updateData.idNumber,
          _id: { $ne: patientId } // Exclude current patient
        });
        
        if (existingPatient) {
          const error = new Error('Another patient with this ID number already exists');
          error.statusCode = 400;
          throw error;
        }
      }
      
      // Update the patient and return the updated document
      const updatedPatient = await Patient.findByIdAndUpdate(
        patientId,
        updateData,
        { new: true, runValidators: true }
      );
      
      return updatedPatient;
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  }

  /**
   * Soft delete a patient (mark as inactive)
   * @param {string} patientId - MongoDB ID of the patient
   * @returns {Promise<Object>} - Result of the operation
   */
  async deletePatient(patientId) {
    try {
      // Check if patient exists
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        const error = new Error('Patient not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Soft delete by setting isActive to false
      const result = await Patient.findByIdAndUpdate(
        patientId,
        { isActive: false },
        { new: true }
      );
      
      return { success: true, message: 'Patient deactivated successfully', patient: result };
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  }

  /**
   * Search patients by various criteria
   * @param {Object} searchParams - Search parameters
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Results per page (default: 10)
   * @returns {Promise<Object>} - Search results and pagination metadata
   */
  async searchPatients(searchParams, page = 1, limit = 10) {
    try {
      // Convert page and limit to numbers
      page = Math.max(1, parseInt(page));
      limit = Math.min(100, Math.max(1, parseInt(limit)));
      
      // Build search query
      const query = { isActive: true }; // Default to active patients
      
      // Process search parameters
      if (searchParams.name) {
        // Search in both first name and last name with case insensitivity
        const nameQuery = new RegExp(searchParams.name, 'i');
        query.$or = [
          { firstName: nameQuery },
          { lastName: nameQuery }
        ];
      }
      
      if (searchParams.idNumber) {
        query.idNumber = searchParams.idNumber;
      }
      
      if (searchParams.email) {
        query.email = new RegExp(searchParams.email, 'i');
      }
      
      if (searchParams.phone) {
        query.phone = new RegExp(searchParams.phone, 'i');
      }
      
      if (searchParams.gender) {
        query.gender = searchParams.gender;
      }
      
      if (searchParams.minAge || searchParams.maxAge) {
        // Calculate date range based on age
        const now = new Date();
        const yearNow = now.getFullYear();
        
        query.dateOfBirth = {};
        
        if (searchParams.minAge) {
          // Someone with minAge would be born before (current year - minAge)
          const maxBirthYear = yearNow - parseInt(searchParams.minAge);
          const maxBirthDate = new Date(maxBirthYear, now.getMonth(), now.getDate());
          query.dateOfBirth.$lte = maxBirthDate;
        }
        
        if (searchParams.maxAge) {
          // Someone with maxAge would be born after (current year - maxAge - 1)
          const minBirthYear = yearNow - parseInt(searchParams.maxAge) - 1;
          const minBirthDate = new Date(minBirthYear, now.getMonth(), now.getDate());
          query.dateOfBirth.$gte = minBirthDate;
        }
      }
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Execute search query with pagination
      const patients = await Patient.find(query)
        .sort({ lastName: 1, firstName: 1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count of matching documents
      const totalPatients = await Patient.countDocuments(query);
      
      // Calculate total pages
      const totalPages = Math.ceil(totalPatients / limit);
      
      return {
        patients,
        pagination: {
          total: totalPatients,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      error.statusCode = 500;
      throw error;
    }
  }
}

module.exports = new PatientService();

