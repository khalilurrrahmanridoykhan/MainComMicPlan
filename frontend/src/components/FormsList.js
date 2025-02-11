import React, { useEffect, useState } from "react";
import { fetchForms } from "../api";

const FormsList = () => {
    const [forms, setForms] = useState([]);

    useEffect(() => {
        fetchForms().then(response => setForms(response.data));
    }, []);

    return (
        <div>
            <h2>Forms</h2>
            <ul>
                {forms.map(form => (
                    <li key={form.id}>{form.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default FormsList;
