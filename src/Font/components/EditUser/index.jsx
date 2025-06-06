// trang chinh suwa thong tin user
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { updateUser } from '../../lib/fetchModelData';

function EditUser() {

    const navigate = useNavigate();
    const { user, setUser, setCurrentContext } = useAppContext();
    const [editedUser, setEditedUser] = useState({ ...user });

    // useEffect để set context title khi component mount
    useEffect(() => {
        setCurrentContext('Edit User');
        // Cleanup function để reset context khi component unmount
        return () => setCurrentContext('');
    }, [setCurrentContext]);

  
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditedUser((prev) => ({ ...prev, [name]: value }));
    };

    
    const handleSave = async () => {
        try {
            // Gọi API để cập nhật thông tin user
            await updateUser(editedUser);
            // Cập nhật state user trong global context
            setUser(editedUser);
            // Điều hướng về trang profile sau khi lưu thành công
            // navigate('/profile');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <div>
            <h1>Edit User</h1>
            <form>
                <label>
                    firstName:
                    <input type="text" name='first_name' value={editedUser.first_name} onChange={handleInputChange} />
                </label><br />
                <label>
                    lastName:
                    <input type="text" name='last_name' value={editedUser.last_name} onChange={handleInputChange} />
                </label><br />
                <label>
                    location:
                    <input type="text" name='location' value={editedUser.location} onChange={handleInputChange} />
                </label><br />
                <label>
                    occupation:
                    <input type="text" name='occupation' value={editedUser.occupation} onChange={handleInputChange} />
                </label><br />
                <label>
                    description:
                    <input type="text" name='description' value={editedUser.description} onChange={handleInputChange} />
                </label><br />

                <button type="button" onClick={handleSave}>Save</button>
            </form>
        </div>
    );
}

export default EditUser;