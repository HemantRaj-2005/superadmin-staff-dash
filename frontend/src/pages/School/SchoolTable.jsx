// components/SchoolTable.js
import React from 'react';
import { Edit2, Trash2, MapPin, Building } from 'lucide-react';

const SchoolTable = ({ schools, loading, onSchoolClick, onEditSchool, onDeleteSchool }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-6 border-b border-gray-200 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-64"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🏫</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
        <p className="text-gray-500">Try adjusting your search filters or add a new school.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UDISE Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schools.map((school) => (
              <tr 
                key={school._id} 
                className="hover:bg-gray-50 cursor-pointer transition duration-150 group"
                onClick={() => onSchoolClick(school)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition duration-150">
                        {school.school_name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        ID: {school._id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                    <div>
                      <div>{school.district}</div>
                      <div className="text-gray-500 text-xs">{school.state}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {school.udise_code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(school.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {onEditSchool && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSchool(school);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition duration-150"
                        title="Edit School"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {/* {onDeleteSchool && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSchool(school._id);
                        }}
                        className="text-red-600 hover:text-red-900 transition duration-150"
                        title="Delete School"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )} */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchoolTable;