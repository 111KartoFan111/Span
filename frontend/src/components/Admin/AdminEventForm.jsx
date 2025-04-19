import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/AdminForms.css';

const AdminVenueForm = ({ venue, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    capacity: 100,
    latitude: null,
    longitude: null
  });
  const [errors, setErrors] = useState({});

  // Инициализация формы при редактировании существующего места проведения
  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        address: venue.address || '',
        description: venue.description || '',
        capacity: venue.capacity || 100,
        latitude: venue.latitude || null,
        longitude: venue.longitude || null
      });
    }
  }, [venue]);

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Для числовых полей преобразуем значение в число
    const processedValue = type === 'number' ? 
      (value === '' ? '' : Number(value)) : 
      value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue
    }));
    
    // Сбрасываем ошибку для поля, которое изменилось
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('admin.venues.validation.nameRequired');
    }
    
    if (!formData.address.trim()) {
      newErrors.address = t('admin.venues.validation.addressRequired');
    }
    
    if (formData.capacity <= 0) {
      newErrors.capacity = t('admin.venues.validation.capacityPositive');
    }
    
    // Проверка валидности координат, если они указаны
    if (formData.latitude !== null && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = t('admin.venues.validation.invalidLatitude');
    }
    
    if (formData.longitude !== null && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = t('admin.venues.validation.invalidLongitude');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Обработчик автоматического получения координат по адресу
  const handleGeocoding = async () => {
    if (!formData.address.trim()) {
      setErrors(prevErrors => ({
        ...prevErrors,
        address: t('admin.venues.validation.addressRequired')
      }));
      return;
    }
    
    try {
      // Здесь можно реализовать интеграцию с геокодингом,
      // например через Nominatim или Google Maps Geocoding API
      // Примерная реализация:
      
      // Для примера, устанавливаем случайные координаты
      const randomLat = 43.2 + Math.random() * 0.4; // Примерные координаты Казахстана
      const randomLng = 76.8 + Math.random() * 0.4;
      
      setFormData(prevData => ({
        ...prevData,
        latitude: randomLat,
        longitude: randomLng
      }));
      
      // В реальном приложении здесь будет запрос к API геокодинга
      /*
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFormData(prevData => ({
          ...prevData,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          address: t('admin.venues.validation.geocodingFailed')
        }));
      }
      */
    } catch (error) {
      console.error('Ошибка геокодинга:', error);
      setErrors(prevErrors => ({
        ...prevErrors,
        address: t('admin.venues.validation.geocodingError')
      }));
    }
  };

  return (
    <div className="admin-form-container">
      <h2>
        {venue ? t('admin.venues.editVenue') : t('admin.venues.createVenue')}
      </h2>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">{t('admin.venues.name')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="capacity">{t('admin.venues.capacity')} *</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              className={errors.capacity ? 'error' : ''}
            />
            {errors.capacity && <div className="error-message">{errors.capacity}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="address">{t('admin.venues.address')} *</label>
          <div className="input-with-button">
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
            />
            <button
              type="button"
              className="geocode-button"
              onClick={handleGeocoding}
            >
                {t('admin.venues.geocode')}
            </button>
          </div>
            {errors.address && <div className="error-message">{errors.address}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="latitude">{t('admin.venues.latitude')}</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="longitude">{t('admin.venues.longitude')}</label>
          <input      
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">{t('admin.venues.description')}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="save-button">
            {venue ? t('admin.venues.saveChanges') : t('admin.venues.create')}
          </button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminVenueForm;