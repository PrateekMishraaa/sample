"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [selectedUser, setSelectedUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, sortOption]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("https://jsonplaceholder.typicode.com/users");
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (userId) => {
    setLoading(true);
    setSelectedUser(userId);
    setPosts([]);
    setPage(1);
    try {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?userId=${userId}&_limit=5&_page=${page}`
      );
      setPosts(data);
    } catch (err) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    setPage(page + 1);
    try {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?userId=${selectedUser}&_limit=5&_page=${page + 1}`
      );
      setPosts((prev) => [...prev, ...data]);
    } catch (err) {
      setError("Failed to load more posts");
    }
  };

  const filterAndSortUsers = () => {
    let updatedUsers = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    updatedUsers.sort((a, b) => (a[sortOption] > b[sortOption] ? 1 : -1));
    setFilteredUsers(updatedUsers);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users & Posts Dashboard</h1>
      <input
        type="text"
        placeholder="Search users by name or email"
        className="border p-2 mb-4 w-full bg-black"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select className="border p-2 mb-4 bg-black" onChange={(e) => setSortOption(e.target.value)}>
        <option value="name">Sort by Name</option>
        <option value="company.name">Sort by Company</option>
      </select>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <ul className="space-y-2">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className={`cursor-pointer p-4 border rounded shadow-md hover:bg-gray-200 ${selectedUser === user.id ? 'bg-gray-300' : ''}`}
                onClick={() => fetchPosts(user.id)}
              >
                <p className="font-bold text-gray-700">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">{`${user.address.street}, ${user.address.suite}, ${user.address.city}, ${user.address.zipcode}`}</p>
                <p className="text-sm font-semibold">{user.company.name}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Posts</h2>
          {selectedUser && <p className="text-lg font-semibold mb-2">Posts by {users.find(u => u.id === selectedUser)?.name}</p>}
          <ul className="space-y-2">
            {posts.map((post) => (
              <li key={post.id} className="p-4 border rounded shadow-md">
                <h3 className="font-bold text-lg">{post.title}</h3>
                <p className="text-sm text-gray-700">{post.body}</p>
              </li>
            ))}
          </ul>
          {posts.length > 0 && (
            <button className="mt-4 p-2 bg-blue-500 text-white rounded" onClick={loadMorePosts}>
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
