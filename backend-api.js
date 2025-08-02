const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Enquiry Schema (Enhanced)
const enquirySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productname: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  UserNumber: {
    type: String,
    required: true
  },
  buyerName: {
    type: String,
    default: 'Anonymous'
  },
  buyerEmail: {
    type: String
  },
  buyerCompany: {
    type: String
  },
  country: {
    type: String,
    default: 'India'
  },
  region: {
    type: String
  },
  message: {
    type: String
  },
  quantity: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled', 'In Progress'],
    default: 'Pending'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    note: String,
    createdBy: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  source: {
    type: String,
    default: 'Website'
  }
}, {
  timestamps: true
});

// Create indexes for better performance
enquirySchema.index({ vendorId: 1, status: 1 });
enquirySchema.index({ vendorId: 1, isRead: 1 });
enquirySchema.index({ vendorId: 1, createdAt: -1 });
enquirySchema.index({ productname: 'text', buyerName: 'text' });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Vendor Schema (if not exists)
const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  company: String,
  selectType: String,
  // Add other vendor fields as needed
}, {
  timestamps: true
});

const Vendor = mongoose.model('Vendor', vendorSchema);

// Product Schema (if not exists)
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: [String],
  description: String,
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// Middleware to verify vendor token
const verifyVendorToken = (req, res, next) => {
  const token = req.body.vendortoken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.vendorId = decoded.vendorId;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

// Get vendor data
app.post('/vendorData', verifyVendorToken, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) {
      return res.json({ status: 'error', message: 'Vendor not found' });
    }
    res.json({ status: 'ok', data: vendor });
  } catch (error) {
    console.error('Error fetching vendor data:', error);
    res.json({ status: 'error', message: 'Server error' });
  }
});

// Get vendor enquiries with enhanced filtering and pagination
app.post('/getVendorEnquiry', async (req, res) => {
  try {
    const { 
      vendorId, 
      page = 1, 
      limit = 10, 
      status, 
      isRead, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      priority
    } = req.body;

    if (!vendorId) {
      return res.json({ status: 'error', message: 'Vendor ID is required' });
    }

    // Build query
    const query = { vendorId: mongoose.Types.ObjectId(vendorId) };

    // Add filters
    if (status && status !== 'All') {
      query.status = status;
    }

    if (typeof isRead === 'boolean') {
      query.isRead = isRead;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Search filter
    if (search) {
      query.$or = [
        { productname: { $regex: search, $options: 'i' } },
        { buyerName: { $regex: search, $options: 'i' } },
        { UserNumber: { $regex: search, $options: 'i' } },
        { buyerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const enquiries = await Enquiry.find(query)
      .populate('product_id', 'name price image description')
      .populate('assignedTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Enquiry.countDocuments(query);

    // Get status counts for dashboard
    const statusCounts = await Enquiry.aggregate([
      { $match: { vendorId: mongoose.Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          starred: { $sum: { $cond: [{ $eq: ['$isStarred', true] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      status: 'ok',
      data: enquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      counts: statusCounts[0] || {
        total: 0, pending: 0, completed: 0, cancelled: 0, 
        inProgress: 0, unread: 0, starred: 0
      }
    });

  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.json({ status: 'error', message: 'Error fetching enquiries' });
  }
});

// Update enquiry status
app.post('/updateEnquiryStatus', async (req, res) => {
  try {
    const { enquiryId, status } = req.body;

    if (!enquiryId || !status) {
      return res.json({ status: 'error', message: 'Enquiry ID and status are required' });
    }

    const validStatuses = ['Pending', 'Completed', 'Cancelled', 'In Progress'];
    if (!validStatuses.includes(status)) {
      return res.json({ status: 'error', message: 'Invalid status' });
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedEnquiry) {
      return res.json({ status: 'error', message: 'Enquiry not found' });
    }

    res.json({ status: 'ok', message: 'Status updated successfully', data: updatedEnquiry });

  } catch (error) {
    console.error('Error updating status:', error);
    res.json({ status: 'error', message: 'Error updating status' });
  }
});

// Update enquiry read status (single or bulk)
app.post('/updateEnquiryReadStatus', async (req, res) => {
  try {
    const { enquiryIds, isRead } = req.body;

    if (!enquiryIds || typeof isRead !== 'boolean') {
      return res.json({ status: 'error', message: 'Enquiry IDs and read status are required' });
    }

    const ids = Array.isArray(enquiryIds) ? enquiryIds : [enquiryIds];

    const result = await Enquiry.updateMany(
      { _id: { $in: ids } },
      { 
        isRead,
        updatedAt: new Date()
      }
    );

    res.json({ 
      status: 'ok', 
      message: 'Read status updated successfully',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating read status:', error);
    res.json({ status: 'error', message: 'Error updating read status' });
  }
});

// Update enquiry starred status (single or bulk)
app.post('/updateEnquiryStarredStatus', async (req, res) => {
  try {
    const { enquiryIds, isStarred } = req.body;

    if (!enquiryIds || typeof isStarred !== 'boolean') {
      return res.json({ status: 'error', message: 'Enquiry IDs and starred status are required' });
    }

    const ids = Array.isArray(enquiryIds) ? enquiryIds : [enquiryIds];

    const result = await Enquiry.updateMany(
      { _id: { $in: ids } },
      { 
        isStarred,
        updatedAt: new Date()
      }
    );

    res.json({ 
      status: 'ok', 
      message: 'Starred status updated successfully',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating starred status:', error);
    res.json({ status: 'error', message: 'Error updating starred status' });
  }
});

// Bulk update enquiry status
app.post('/bulkUpdateEnquiryStatus', async (req, res) => {
  try {
    const { enquiryIds, status } = req.body;

    if (!enquiryIds || !status) {
      return res.json({ status: 'error', message: 'Enquiry IDs and status are required' });
    }

    const validStatuses = ['Pending', 'Completed', 'Cancelled', 'In Progress'];
    if (!validStatuses.includes(status)) {
      return res.json({ status: 'error', message: 'Invalid status' });
    }

    const ids = Array.isArray(enquiryIds) ? enquiryIds : [enquiryIds];

    const result = await Enquiry.updateMany(
      { _id: { $in: ids } },
      { 
        status,
        updatedAt: new Date()
      }
    );

    res.json({ 
      status: 'ok', 
      message: 'Status updated successfully',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating status:', error);
    res.json({ status: 'error', message: 'Error updating status' });
  }
});

// Delete enquiries (single or bulk)
app.post('/deleteEnquiries', async (req, res) => {
  try {
    const { enquiryIds } = req.body;

    if (!enquiryIds) {
      return res.json({ status: 'error', message: 'Enquiry IDs are required' });
    }

    const ids = Array.isArray(enquiryIds) ? enquiryIds : [enquiryIds];

    const result = await Enquiry.deleteMany({ _id: { $in: ids } });

    res.json({ 
      status: 'ok', 
      message: 'Enquiries deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting enquiries:', error);
    res.json({ status: 'error', message: 'Error deleting enquiries' });
  }
});

// Reassign enquiries to another user
app.post('/reassignEnquiries', async (req, res) => {
  try {
    const { enquiryIds, assignedTo } = req.body;

    if (!enquiryIds || !assignedTo) {
      return res.json({ status: 'error', message: 'Enquiry IDs and assigned user are required' });
    }

    const ids = Array.isArray(enquiryIds) ? enquiryIds : [enquiryIds];

    const result = await Enquiry.updateMany(
      { _id: { $in: ids } },
      { 
        assignedTo,
        updatedAt: new Date()
      }
    );

    res.json({ 
      status: 'ok', 
      message: 'Enquiries reassigned successfully',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error reassigning enquiries:', error);
    res.json({ status: 'error', message: 'Error reassigning enquiries' });
  }
});

// Add note to enquiry
app.post('/addEnquiryNote', async (req, res) => {
  try {
    const { enquiryId, note, createdBy } = req.body;

    if (!enquiryId || !note) {
      return res.json({ status: 'error', message: 'Enquiry ID and note are required' });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { 
        $push: { 
          notes: {
            note,
            createdBy: createdBy || 'System',
            createdAt: new Date()
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!enquiry) {
      return res.json({ status: 'error', message: 'Enquiry not found' });
    }

    res.json({ status: 'ok', message: 'Note added successfully', data: enquiry });

  } catch (error) {
    console.error('Error adding note:', error);
    res.json({ status: 'error', message: 'Error adding note' });
  }
});

// Get enquiry details by ID
app.get('/getEnquiryDetails/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findById(id)
      .populate('product_id', 'name price image description')
      .populate('assignedTo', 'name email')
      .populate('vendorId', 'name email company');

    if (!enquiry) {
      return res.json({ status: 'error', message: 'Enquiry not found' });
    }

    res.json({ status: 'ok', data: enquiry });

  } catch (error) {
    console.error('Error fetching enquiry details:', error);
    res.json({ status: 'error', message: 'Error fetching enquiry details' });
  }
});

// Export enquiry data
app.post('/exportEnquiryData', async (req, res) => {
  try {
    const { vendorId, format = 'json', filters = {} } = req.body;

    if (!vendorId) {
      return res.json({ status: 'error', message: 'Vendor ID is required' });
    }

    const query = { vendorId: mongoose.Types.ObjectId(vendorId), ...filters };

    const enquiries = await Enquiry.find(query)
      .populate('product_id', 'name price')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = enquiries.map(enquiry => ({
        ID: enquiry._id,
        ProductName: enquiry.productname,
        Price: enquiry.productPrice,
        BuyerName: enquiry.buyerName,
        Phone: enquiry.UserNumber,
        Status: enquiry.status,
        IsRead: enquiry.isRead ? 'Yes' : 'No',
        CreatedAt: enquiry.createdAt,
        UpdatedAt: enquiry.updatedAt
      }));

      res.json({ status: 'ok', data: csvData, format: 'csv' });
    } else {
      res.json({ status: 'ok', data: enquiries, format: 'json' });
    }

  } catch (error) {
    console.error('Error exporting data:', error);
    res.json({ status: 'error', message: 'Error exporting data' });
  }
});

// Get dashboard statistics
app.post('/getEnquiryStats', async (req, res) => {
  try {
    const { vendorId, dateRange = 30 } = req.body;

    if (!vendorId) {
      return res.json({ status: 'error', message: 'Vendor ID is required' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const stats = await Enquiry.aggregate([
      { 
        $match: { 
          vendorId: mongoose.Types.ObjectId(vendorId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEnquiries: { $sum: 1 },
          pendingEnquiries: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          completedEnquiries: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          cancelledEnquiries: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          unreadEnquiries: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          avgResponseTime: { $avg: '$responseTime' },
          totalValue: { $sum: '$productPrice' }
        }
      }
    ]);

    // Get daily trends
    const dailyTrends = await Enquiry.aggregate([
      { 
        $match: { 
          vendorId: mongoose.Types.ObjectId(vendorId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ 
      status: 'ok', 
      data: {
        summary: stats[0] || {},
        dailyTrends
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({ status: 'error', message: 'Error fetching statistics' });
  }
});

// Create new enquiry
app.post('/createEnquiry', async (req, res) => {
  try {
    const enquiryData = req.body;
    
    const newEnquiry = new Enquiry({
      ...enquiryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedEnquiry = await newEnquiry.save();
    
    res.json({ status: 'ok', message: 'Enquiry created successfully', data: savedEnquiry });

  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.json({ status: 'error', message: 'Error creating enquiry' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;