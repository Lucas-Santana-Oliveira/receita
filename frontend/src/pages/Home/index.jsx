import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LayoutComponents } from "../../components/LayoutComponents";


const Home = () => {
  const [message, setMessage] = useState('');
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [recipeSaved, setRecipeSaved] = useState(false);

  useEffect(() => {
    const savedRecipesFromStorage = JSON.parse(localStorage.getItem('savedRecipes'));
    if (savedRecipesFromStorage) {
      setSavedRecipes(savedRecipesFromStorage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  // Certifique-se de fornecer a URL correta do Google AI
  const genAI = new GoogleGenerativeAI("AIzaSyC-hXZ_KT2zkjJ9WC-fBDp3DFnEY07FhkI");

  const sendMessage = async () => {
    if (!message) return;

    setStatus('Preparando a receita...');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(message, { includeRecipeName: true });
      const response = await result.response;
      const text = await response.text();

      setResponseText(text);
      setStatus('');
      setRecipeSaved(false); 
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
      setStatus('Erro, tente novamente mais tarde...');
    }
  };

  const handleSaveRecipe = () => {
    if (!responseText) return;

    const newRecipe = {
      name: responseText,
      description: responseText
     
    };

    const updatedRecipes = [...savedRecipes, newRecipe];
    setSavedRecipes(updatedRecipes);
    setRecipeSaved(true);

    setMessage('');
    setResponseText('');
  };

  const handleDeleteRecipe = (index) => {
    const updatedRecipes = savedRecipes.filter((_, i) => i !== index);
    setSavedRecipes(updatedRecipes);
  };

  return (
    <LayoutComponents>
      <div className="box-questions">
        <div className="header">
          <p className="title">Receita-IA</p>
        </div>
        <p className="status-message">{status}</p>
        <div className="footer">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ingredientes..."
            className="input-message"
          />
          <button className="btn-submit" onClick={sendMessage}>Enviar</button>
        </div>
        <div className={recipeSaved ? "response-text has-content" : "response-text"}>
          {responseText}
          {responseText && !recipeSaved && <button onClick={handleSaveRecipe} className="btn-save-recipe">Salvar</button>}
        </div>

        <div className="recipe-list">
          <ul>
            {savedRecipes.map((recipe, index) => (
              <li key={index} className="recipe-list-item">
                <div>{recipe.name}</div>
                <div>{recipe.description}</div>
                <div>Tempo de Preparo: {recipe.time}</div>
                <button onClick={() => handleDeleteRecipe(index)} className="recipe-delete-button">Deletar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LayoutComponents>
  );
};

export default Home;
