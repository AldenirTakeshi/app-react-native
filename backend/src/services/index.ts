import { User } from '../models'; // Exemplo de importação de modelo

// Função para obter todos os usuários
export const getAllUsers = async () => {
    return await User.find(); // Exemplo de operação com modelo
};

// Função para obter um usuário por ID
export const getUserById = async (id: string) => {
    return await User.findById(id); // Exemplo de operação com modelo
};

// Função para criar um novo usuário
export const createUser = async (userData: any) => {
    const user = new User(userData);
    return await user.save(); // Exemplo de operação com modelo
};

// Função para atualizar um usuário
export const updateUser = async (id: string, userData: any) => {
    return await User.findByIdAndUpdate(id, userData, { new: true }); // Exemplo de operação com modelo
};

// Função para deletar um usuário
export const deleteUser = async (id: string) => {
    return await User.findByIdAndDelete(id); // Exemplo de operação com modelo
};