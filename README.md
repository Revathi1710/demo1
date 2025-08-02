# Inquiry Management System - Backend API

A comprehensive backend API for managing customer inquiries with features like read/unread status tracking, bulk operations, filtering, and more.

## 🚀 Features

- **Complete Inquiry Management**: Create, read, update, delete inquiries
- **Read Status Tracking**: Mark inquiries as read/unread (individual & bulk)
- **Status Management**: Pending, Completed, Cancelled, In Progress
- **Advanced Filtering**: Filter by status, read status, date range, priority
- **Search Functionality**: Search by product name, buyer details, phone number
- **Bulk Operations**: Mark multiple inquiries as read/unread, delete, reassign
- **Pagination**: Efficient pagination for large datasets
- **Statistics Dashboard**: Get inquiry counts and trends
- **Data Export**: Export inquiry data in JSON/CSV format
- **Notes System**: Add notes to inquiries
- **Star/Priority System**: Mark important inquiries
- **User Assignment**: Assign inquiries to team members

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd inquiry-management-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

4. **Database Setup**
```bash
# Make sure MongoDB is running locally or update MONGODB_URI in .env
# The application will create the necessary collections automatically
```

5. **Start the server**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 🔧 Environment Variables

Key environment variables you need to configure:

```env
MONGODB_URI=mongodb://localhost:27017/inquiry_management
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
```

See `.env.example` for all available configuration options.

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication
Most endpoints require a valid JWT token. Include it in the request body as `vendortoken` or in the Authorization header as `Bearer <token>`.

### Core Endpoints

#### 1. Get Vendor Enquiries
```http
POST /getVendorEnquiry
Content-Type: application/json

{
  "vendorId": "vendor_id_here",
  "page": 1,
  "limit": 10,
  "status": "Pending",
  "isRead": false,
  "search": "search_term",
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

**Response:**
```json
{
  "status": "ok",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "counts": {
    "total": 50,
    "unread": 15,
    "pending": 20,
    "completed": 25
  }
}
```

#### 2. Update Read Status
```http
POST /updateEnquiryReadStatus
Content-Type: application/json

{
  "enquiryIds": ["id1", "id2"],
  "isRead": true
}
```

#### 3. Update Enquiry Status
```http
POST /updateEnquiryStatus
Content-Type: application/json

{
  "enquiryId": "enquiry_id",
  "status": "Completed"
}
```

#### 4. Bulk Status Update
```http
POST /bulkUpdateEnquiryStatus
Content-Type: application/json

{
  "enquiryIds": ["id1", "id2"],
  "status": "Completed"
}
```

#### 5. Delete Enquiries
```http
POST /deleteEnquiries
Content-Type: application/json

{
  "enquiryIds": ["id1", "id2"]
}
```

#### 6. Export Data
```http
POST /exportEnquiryData
Content-Type: application/json

{
  "vendorId": "vendor_id",
  "format": "csv",
  "filters": {
    "status": "Pending"
  }
}
```

#### 7. Get Statistics
```http
POST /getEnquiryStats
Content-Type: application/json

{
  "vendorId": "vendor_id",
  "dateRange": 30
}
```

### Complete API Endpoints List

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vendorData` | Get vendor information |
| POST | `/getVendorEnquiry` | Get paginated enquiries with filters |
| POST | `/updateEnquiryStatus` | Update single enquiry status |
| POST | `/updateEnquiryReadStatus` | Update read status (bulk) |
| POST | `/updateEnquiryStarredStatus` | Update starred status (bulk) |
| POST | `/bulkUpdateEnquiryStatus` | Bulk update enquiry status |
| POST | `/deleteEnquiries` | Delete enquiries (bulk) |
| POST | `/reassignEnquiries` | Reassign enquiries to users |
| POST | `/addEnquiryNote` | Add note to enquiry |
| GET | `/getEnquiryDetails/:id` | Get single enquiry details |
| POST | `/exportEnquiryData` | Export enquiry data |
| POST | `/getEnquiryStats` | Get dashboard statistics |
| POST | `/createEnquiry` | Create new enquiry |

## 🗃️ Database Schema

### Enquiry Model
```javascript
{
  vendorId: ObjectId,           // Reference to vendor
  product_id: ObjectId,         // Reference to product
  productname: String,          // Product name
  productPrice: Number,         // Product price
  UserNumber: String,           // Buyer's phone number
  buyerName: String,            // Buyer's name
  buyerEmail: String,           // Buyer's email
  country: String,              // Buyer's country
  status: Enum,                 // Pending|Completed|Cancelled|In Progress
  isRead: Boolean,              // Read status
  isStarred: Boolean,           // Starred status
  priority: Enum,               // Low|Medium|High
  assignedTo: ObjectId,         // Assigned user
  notes: Array,                 // Array of notes
  tags: Array,                  // Array of tags
  timestamps: true              // createdAt, updatedAt
}
```

## 🔒 Security Features

- JWT token authentication
- Input validation and sanitization
- CORS protection
- Rate limiting (configurable)
- Helmet security headers
- MongoDB injection protection

## 📊 Performance Features

- Database indexing for fast queries
- Pagination for large datasets
- Efficient aggregation pipelines
- Connection pooling
- Response compression

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start backend-api.js --name "inquiry-api"

# Monitor
pm2 monit

# Logs
pm2 logs inquiry-api
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔧 Maintenance

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/inquiry_management" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/inquiry_management" ./backup/inquiry_management
```

### Monitoring
- Check logs regularly: `tail -f logs/app.log`
- Monitor database performance
- Set up health check endpoints
- Use monitoring tools (New Relic, DataDog, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: support@yourcompany.com
- Documentation: [Link to detailed docs]

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete inquiry management system
- Read/unread status tracking
- Bulk operations
- Advanced filtering and search
- Export functionality
- Statistics dashboard