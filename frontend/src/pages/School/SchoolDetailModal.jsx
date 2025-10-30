// components/SchoolDetailModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { X, Edit2, Clipboard, MapPin } from 'lucide-react';
import PropTypes from 'prop-types';
import api from '@/services/api'; // optional, if you want to fetch more details

const SchoolDetailModal = ({ school, onClose, onEdit }) => {
  const dialogTitleId = 'school-detail-title';
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // focus the close button on open
    closeButtonRef.current?.focus();

    // prevent background scroll while modal open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Simple focus trap - keep focus inside modal when tabbing
  useEffect(() => {
    const handleFocus = (e) => {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target)) {
        // move focus back to close button
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  const copyUdise = async () => {
    try {
      await navigator.clipboard.writeText(String(school.udise_code ?? ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const openMaps = () => {
    const q = encodeURIComponent(`${school.district ?? ''} ${school.state ?? ''} ${school.school_name ?? ''}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Format date safely
  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '—';
    return dt.toLocaleString();
  };

  // If you want to lazy-load additional details, you could fetch here using `api`.
  // Example commented out:
  // useEffect(() => { if (school._id) fetchExtra(school._id); }, [school._id]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="presentation"
      onMouseDown={(e) => {
        // close if user clicks on backdrop (but not when clicking inside modal)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 id={dialogTitleId} className="text-2xl font-semibold text-gray-900">
                {school.school_name || 'School details'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {school.district || '—'} · {school.state || '—'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit && onEdit(school)}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  aria-label={`Edit ${school.school_name || 'school'}`}
                >
                  <div className="flex items-center space-x-2">
                    <Edit2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </div>
                </button>
              )}

              <button
                onClick={onClose}
                ref={closeButtonRef}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column - key information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">UDISE Code</h3>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-gray-900">{school.udise_code ?? '—'}</div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyUdise}
                      className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 transition flex items-center space-x-2"
                      aria-label="Copy UDISE code"
                    >
                      <Clipboard className="h-4 w-4" />
                      <span className="text-sm">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={openMaps}
                      className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 transition flex items-center space-x-2"
                      aria-label="Open location in Google Maps"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">Map</span>
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">Unique 11-digit school identifier</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Location</h3>
                <div className="text-sm text-gray-900">
                  <div className="font-semibold">{school.district || '—'}</div>
                  <div className="text-gray-500">{school.state || '—'}</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Created</h3>
                <div className="text-sm text-gray-900">
                  <time dateTime={school.createdAt ? new Date(school.createdAt).toISOString() : undefined}>
                    {formatDate(school.createdAt)}
                  </time>
                </div>
              </div>
            </div>

            {/* Right column - additional details */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Other details</h3>

                {/* Render any extra fields that might be present on the school object */}
                <dl className="grid grid-cols-1 gap-y-2 text-sm text-gray-700">
                  {/* Example: show phone if available */}
                  {school.phone && (
                    <div>
                      <dt className="text-xs text-gray-500">Phone</dt>
                      <dd className="mt-1">{school.phone}</dd>
                    </div>
                  )}

                  {/* You can expand with any other metadata your backend provides */}
                  {school.email && (
                    <div>
                      <dt className="text-xs text-gray-500">Email</dt>
                      <dd className="mt-1">{school.email}</dd>
                    </div>
                  )}

                  {/* Fallback: show raw JSON for debugging / extra fields */}
                  {(!school.phone && !school.email) && (
                    <div>
                      <dt className="text-xs text-gray-500">Raw Data</dt>
                      <dd className="mt-1 text-xs font-mono text-gray-600 max-h-36 overflow-auto bg-gray-50 p-2 rounded">
                        {JSON.stringify(
                          {
                            ...school,
                            // hide very long fields if any
                          },
                          null,
                          2
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Actions / notes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Actions</h3>
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                  {onEdit && (
                    <button
                      onClick={() => onEdit && onEdit(school)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Edit School
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

SchoolDetailModal.propTypes = {
  school: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func // optional
};

export default SchoolDetailModal;
