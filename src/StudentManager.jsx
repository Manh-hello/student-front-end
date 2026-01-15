import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    major: '',
    year: ''
  });

  const API_URL = 'https://student-api-wp7l.onrender.com/api/students';

  // Load dữ liệu từ API
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const text = await response.text(); // Lấy text trước
      
      // Loại bỏ deprecation warnings trước JSON
      const jsonStart = text.indexOf('[');
      const cleanText = jsonStart >= 0 ? text.substring(jsonStart) : text;
      
      const data = JSON.parse(cleanText);
      setStudents(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách sinh viên');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lọc sinh viên theo tìm kiếm
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mở modal thêm mới
  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({ name: '', email: '', phone: '', major: '', year: '' });
    setShowModal(true);
    setError('');
  };

  // Mở modal chỉnh sửa
  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      major: student.major,
      year: student.year
    });
    setShowModal(true);
    setError('');
  };

  // Xóa sinh viên
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStudents(students.filter(s => s.id !== id));
        setError('');
      } else {
        setError('Không thể xóa sinh viên');
      }
    } catch (err) {
      setError('Lỗi khi xóa sinh viên');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.major || !formData.year) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      
      if (editingStudent) {
        // Cập nhật
        const response = await fetch(`${API_URL}/${editingStudent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          setStudents(students.map(s => 
            s.id === editingStudent.id ? result.data : s
          ));
          setShowModal(false);
          setError('');
        } else {
          setError(result.errors ? Object.values(result.errors).flat().join(', ') : 'Lỗi cập nhật');
        }
      } else {
        // Thêm mới
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          setStudents([...students, result.data]);
          setShowModal(false);
          setError('');
        } else {
          setError(result.errors ? Object.values(result.errors).flat().join(', ') : 'Lỗi thêm mới');
        }
      }
    } catch (err) {
      setError('Không thể kết nối với server');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Sinh viên</h1>
          <p className="text-gray-600">Hệ thống quản lý thông tin sinh viên</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Lỗi</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, ngành..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Add button */}
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              <Plus className="w-5 h-5" />
              Thêm sinh viên
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Đang tải...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngành học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Năm vào học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Không tìm thấy sinh viên nào
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{student.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{student.major}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{student.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">
              Tổng số sinh viên: <span className="font-semibold text-gray-800">{students.length}</span>
              {searchTerm && ` • Kết quả tìm kiếm: ${filteredStudents.length}`}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingStudent ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngành học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm vào học <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="2000"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Đang xử lý...' : (editingStudent ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
