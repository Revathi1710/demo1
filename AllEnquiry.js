import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import VendorSidebar from './VendorSidebar';
import Navbar from '../components/navbar';

const AllEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [vendorData, setVendorData] = useState({ selectType: '' });
  const [selectedEnquiries, setSelectedEnquiries] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [readStatus, setReadStatus] = useState('All');

  useEffect(() => {
    const vendorId = localStorage.getItem('vendorId');
    if (!vendorId) {
      alert('Vendor ID not found in local storage');
      return;
    }

    const vendortoken = localStorage.getItem('vendortoken');

    axios.post(`${process.env.REACT_APP_API_URL}/vendorData`, { vendortoken })
      .then(response => {
        if (response.data.status === 'ok') {
          setVendorData(response.data.data);
        } else {
          setError(response.data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message);
      });

    fetch(`${process.env.REACT_APP_API_URL}/getVendorEnquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vendorId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'ok') {
        // Add read status to each enquiry if not present
        const enquiriesWithReadStatus = data.data.map(enquiry => ({
          ...enquiry,
          isRead: enquiry.isRead || false
        }));
        setEnquiries(enquiriesWithReadStatus);
        setFilteredEnquiries(enquiriesWithReadStatus);
      } else {
        console.error('Error:', data.message);
        setMessage('Error fetching enquiries: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      setMessage('Error fetching enquiries');
    });
  }, []);

  useEffect(() => {
    filterEnquiries();
  }, [enquiries, searchKeyword, filterStatus, readStatus]);

  const filterEnquiries = () => {
    let filtered = enquiries;

    // Filter by search keyword
    if (searchKeyword) {
      filtered = filtered.filter(enquiry =>
        enquiry.productname?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        enquiry.UserNumber?.includes(searchKeyword) ||
        enquiry.buyerName?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(enquiry => enquiry.status === filterStatus);
    }

    // Filter by read status
    if (readStatus === 'Unread') {
      filtered = filtered.filter(enquiry => !enquiry.isRead);
    } else if (readStatus === 'Read') {
      filtered = filtered.filter(enquiry => enquiry.isRead);
    }

    setFilteredEnquiries(filtered);
  };

  const handleSubMenuToggle = (index) => {
    setActiveSubMenu(activeSubMenu === index ? null : index);
  };

  const updateStatus = (enquiryId, status) => {
    axios.post(`${process.env.REACT_APP_API_URL}/updateEnquiryStatus`, { enquiryId, status })
      .then(response => {
        if (response.data.status === 'ok') {
          setEnquiries(enquiries.map(enquiry =>
            enquiry._id === enquiryId ? { ...enquiry, status } : enquiry
          ));
        } else {
          console.error('Error updating status:', response.data.message);
          setMessage('Error updating status: ' + response.data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Error updating status');
      });
  };

  const updateReadStatus = (enquiryIds, isRead) => {
    const ids = Array.isArray(enquiryIds) ? enquiryIds : [enquiryIds];
    
    // Update locally first for immediate UI feedback
    setEnquiries(enquiries.map(enquiry =>
      ids.includes(enquiry._id) ? { ...enquiry, isRead } : enquiry
    ));

    // Make API call to update on server
    axios.post(`${process.env.REACT_APP_API_URL}/updateEnquiryReadStatus`, { 
      enquiryIds: ids, 
      isRead 
    })
    .then(response => {
      if (response.data.status !== 'ok') {
        console.error('Error updating read status:', response.data.message);
        setMessage('Error updating read status: ' + response.data.message);
        // Revert changes if API call fails
        setEnquiries(enquiries.map(enquiry =>
          ids.includes(enquiry._id) ? { ...enquiry, isRead: !isRead } : enquiry
        ));
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setMessage('Error updating read status');
      // Revert changes if API call fails
      setEnquiries(enquiries.map(enquiry =>
        ids.includes(enquiry._id) ? { ...enquiry, isRead: !isRead } : enquiry
      ));
    });
  };

  const handleSelectEnquiry = (enquiryId) => {
    setSelectedEnquiries(prev =>
      prev.includes(enquiryId)
        ? prev.filter(id => id !== enquiryId)
        : [...prev, enquiryId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEnquiries(filteredEnquiries.map(enquiry => enquiry._id));
    } else {
      setSelectedEnquiries([]);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedEnquiries.length === 0) {
      alert('Please select enquiries first');
      return;
    }

    switch (action) {
      case 'markRead':
        updateReadStatus(selectedEnquiries, true);
        break;
      case 'markUnread':
        updateReadStatus(selectedEnquiries, false);
        break;
      case 'addStar':
        updateStarredStatus(selectedEnquiries, true);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete selected enquiries?')) {
          deleteEnquiries(selectedEnquiries);
        }
        break;
      default:
        break;
    }
    setSelectedEnquiries([]);
  };

  const updateStarredStatus = (enquiryIds, isStarred) => {
    const ids = Array.isArray(enquiryIds) ? enquiryIds : [enquiryIds];
    
    // Update locally first for immediate UI feedback
    setEnquiries(enquiries.map(enquiry =>
      ids.includes(enquiry._id) ? { ...enquiry, isStarred } : enquiry
    ));

    // Make API call to update on server
    axios.post(`${process.env.REACT_APP_API_URL}/updateEnquiryStarredStatus`, { 
      enquiryIds: ids, 
      isStarred 
    })
    .then(response => {
      if (response.data.status !== 'ok') {
        console.error('Error updating starred status:', response.data.message);
        setMessage('Error updating starred status: ' + response.data.message);
        // Revert changes if API call fails
        setEnquiries(enquiries.map(enquiry =>
          ids.includes(enquiry._id) ? { ...enquiry, isStarred: !isStarred } : enquiry
        ));
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setMessage('Error updating starred status');
      // Revert changes if API call fails
      setEnquiries(enquiries.map(enquiry =>
        ids.includes(enquiry._id) ? { ...enquiry, isStarred: !isStarred } : enquiry
      ));
    });
  };

  const deleteEnquiries = (enquiryIds) => {
    const ids = Array.isArray(enquiryIds) ? enquiryIds : [enquiryIds];

    axios.post(`${process.env.REACT_APP_API_URL}/deleteEnquiries`, { 
      enquiryIds: ids 
    })
    .then(response => {
      if (response.data.status === 'ok') {
        // Remove deleted enquiries from state
        setEnquiries(enquiries.filter(enquiry => !ids.includes(enquiry._id)));
        setMessage(`Successfully deleted ${response.data.deletedCount} enquiries`);
      } else {
        console.error('Error deleting enquiries:', response.data.message);
        setMessage('Error deleting enquiries: ' + response.data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setMessage('Error deleting enquiries');
    });
  };

  const getStatusCounts = () => {
    return {
      all: enquiries.length,
      unread: enquiries.filter(e => !e.isRead).length,
      read: enquiries.filter(e => e.isRead).length,
      pending: enquiries.filter(e => e.status === 'Pending').length,
      completed: enquiries.filter(e => e.status === 'Completed').length,
      cancelled: enquiries.filter(e => e.status === 'Cancelled').length
    };
  };

  const counts = getStatusCounts();

  return (
    <div>
      <Navbar />
      <VendorSidebar />
      
      <div className="inquiry-container">
        <div className="inquiry-header">
          <h2>1:1 Inquiry</h2>
          <div className="inquiry-actions">
            <button className="btn btn-primary">Export inquiry data</button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="inquiry-tabs">
          <button 
            className={`tab ${readStatus === 'All' ? 'active' : ''}`}
            onClick={() => setReadStatus('All')}
          >
            All {counts.all}
          </button>
          <button 
            className={`tab ${readStatus === 'Unread' ? 'active' : ''}`}
            onClick={() => setReadStatus('Unread')}
          >
            Unread {counts.unread}
          </button>
          <button 
            className={`tab ${readStatus === 'Read' ? 'active' : ''}`}
            onClick={() => setReadStatus('Read')}
          >
            Read {counts.read}
          </button>
          <button 
            className={`tab ${filterStatus === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus(filterStatus === 'Pending' ? 'All' : 'Pending')}
          >
            Pending {counts.pending}
          </button>
        </div>

        {/* Action Bar */}
        <div className="inquiry-action-bar">
          <div className="bulk-actions">
            <button 
              className="btn btn-outline-primary"
              onClick={() => handleBulkAction('markRead')}
              disabled={selectedEnquiries.length === 0}
            >
              Mark as Read
            </button>
            <button 
              className="btn btn-outline-primary"
              onClick={() => handleBulkAction('markUnread')}
              disabled={selectedEnquiries.length === 0}
            >
              Mark as Unread
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => handleBulkAction('reassign')}
              disabled={selectedEnquiries.length === 0}
            >
              Reassign
            </button>
            <button 
              className="btn btn-outline-warning"
              onClick={() => handleBulkAction('addStar')}
              disabled={selectedEnquiries.length === 0}
            >
              Add Star
            </button>
            <button 
              className="btn btn-outline-danger"
              onClick={() => handleBulkAction('delete')}
              disabled={selectedEnquiries.length === 0}
            >
              Delete
            </button>
          </div>
          
          <div className="search-filter">
            <select 
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Filter</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Enter a keyword to search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button className="btn btn-outline-secondary">
              <i className="fa fa-search"></i>
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="inquiry-table-header">
          <div className="header-cell">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={selectedEnquiries.length === filteredEnquiries.length && filteredEnquiries.length > 0}
            />
          </div>
          <div className="header-cell">Inquiry Details</div>
          <div className="header-cell">Creation Time</div>
          <div className="header-cell">Country/Region</div>
          <div className="header-cell">Buyer</div>
          <div className="header-cell">Owner</div>
          <div className="header-cell">Last Update</div>
          <div className="header-cell">Actions</div>
        </div>

        {/* Enquiry List */}
        <div className="inquiry-list">
          {message && <div className="alert alert-info">{message}</div>}
          {filteredEnquiries.length > 0 ? (
            filteredEnquiries.map((enquiry) => (
              <div 
                key={enquiry._id} 
                className={`inquiry-row ${!enquiry.isRead ? 'unread' : ''} ${selectedEnquiries.includes(enquiry._id) ? 'selected' : ''}`}
              >
                <div className="row-cell">
                  <input
                    type="checkbox"
                    checked={selectedEnquiries.includes(enquiry._id)}
                    onChange={() => handleSelectEnquiry(enquiry._id)}
                  />
                </div>
                
                <div className="row-cell inquiry-details">
                  <div className="product-info">
                    <img
                      src={`${process.env.REACT_APP_API_URL}/${enquiry.product_id?.image[0].replace('\\', '/')}`}
                      alt={enquiry.productname}
                      className="product-image"
                    />
                    <div className="product-details">
                      <div className="product-name">{enquiry.productname}</div>
                      <div className="product-price">₹{enquiry.productPrice}</div>
                      <a href={`tel:${enquiry.UserNumber}`} className="contact-number">
                        <i className="fa fa-phone"></i> {enquiry.UserNumber}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="row-cell">
                  {new Date(enquiry.createdAt || Date.now()).toLocaleDateString()}
                </div>
                
                <div className="row-cell">
                  India
                </div>
                
                <div className="row-cell">
                  {enquiry.buyerName || 'Anonymous'}
                </div>
                
                <div className="row-cell">
                  {vendorData.name || 'You'}
                </div>
                
                <div className="row-cell">
                  {new Date(enquiry.updatedAt || enquiry.createdAt || Date.now()).toLocaleDateString()}
                </div>
                
                <div className="row-cell actions">
                  <div className="status-buttons">
                    <button
                      className={`btn btn-sm ${enquiry.status === 'Pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => updateStatus(enquiry._id, 'Pending')}
                    >
                      Pending
                    </button>
                    <button
                      className={`btn btn-sm ${enquiry.status === 'Completed' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => updateStatus(enquiry._id, 'Completed')}
                    >
                      Completed
                    </button>
                    <button
                      className={`btn btn-sm ${enquiry.status === 'Cancelled' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => updateStatus(enquiry._id, 'Cancelled')}
                    >
                      Cancelled
                    </button>
                  </div>
                  <div className="read-actions">
                    {!enquiry.isRead ? (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => updateReadStatus(enquiry._id, true)}
                      >
                        Mark as Read
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => updateReadStatus(enquiry._id, false)}
                      >
                        Mark as Unread
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-inquiries">
              <div className="empty-state">
                <img src="/path/to/empty-box-icon.svg" alt="No inquiries" />
                <p>You have not received any inquiry</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .inquiry-container {
          padding: 20px;
          background: #fff;
          min-height: 100vh;
        }

        .inquiry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }

        .inquiry-header h2 {
          margin: 0;
          color: #333;
          font-size: 24px;
        }

        .inquiry-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .tab {
          background: none;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          color: #666;
          font-weight: 500;
        }

        .tab.active {
          color: #e74c3c;
          border-bottom-color: #e74c3c;
        }

        .tab:hover {
          color: #333;
        }

        .inquiry-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
        }

        .bulk-actions {
          display: flex;
          gap: 10px;
        }

        .search-filter {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-filter input {
          width: 300px;
        }

        .inquiry-table-header {
          display: grid;
          grid-template-columns: 40px 2fr 120px 120px 150px 120px 120px 200px;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px 5px 0 0;
          border: 1px solid #dee2e6;
          font-weight: 600;
          color: #495057;
        }

        .header-cell {
          display: flex;
          align-items: center;
        }

        .inquiry-list {
          border: 1px solid #dee2e6;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }

        .inquiry-row {
          display: grid;
          grid-template-columns: 40px 2fr 120px 120px 150px 120px 120px 200px;
          gap: 15px;
          padding: 15px;
          border-bottom: 1px solid #eee;
          align-items: center;
          transition: background-color 0.2s;
        }

        .inquiry-row:hover {
          background: #f8f9fa;
        }

        .inquiry-row.unread {
          background: #fff3cd;
          font-weight: 500;
        }

        .inquiry-row.selected {
          background: #e3f2fd;
        }

        .row-cell {
          display: flex;
          align-items: center;
        }

        .inquiry-details {
          flex-direction: column;
          align-items: flex-start;
        }

        .product-info {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 5px;
          border: 1px solid #ddd;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .product-name {
          font-weight: 600;
          color: #333;
        }

        .product-price {
          color: #28a745;
          font-weight: 500;
        }

        .contact-number {
          color: #007bff;
          text-decoration: none;
          font-size: 14px;
        }

        .contact-number:hover {
          text-decoration: underline;
        }

        .actions {
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
        }

        .status-buttons {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .read-actions {
          width: 100%;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }

        .no-inquiries {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state img {
          width: 120px;
          height: 120px;
          opacity: 0.5;
          margin-bottom: 20px;
        }

        .empty-state p {
          color: #666;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .inquiry-table-header,
          .inquiry-row {
            grid-template-columns: 40px 1fr;
            grid-template-rows: auto;
          }

          .inquiry-action-bar {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .bulk-actions {
            flex-wrap: wrap;
          }

          .search-filter {
            flex-direction: column;
            align-items: stretch;
          }

          .search-filter input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AllEnquiry;