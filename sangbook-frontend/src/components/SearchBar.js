import React from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ searchTerm, setSearchTerm, users = [], groups = [], API_BASE_URL }) => {
  const navigate = useNavigate();

  // Tìm kiếm cả người dùng và nhóm
  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Tìm kiếm trên SangBook"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <div className="search-results">
          {filteredUsers.length > 0 || filteredGroups.length > 0 ? (
            <>
              {filteredUsers.map((user) => (
                <div
                  key={`user-${user.id}`}
                  className="search-item"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <img
                    src={`${API_BASE_URL}/${user.avatar}`}
                    alt=""
                    className="img-avt"
                  />
                  <span>{user.username}</span>
                </div>
              ))}
              {filteredGroups.map((group) => (
                <div
                  key={`group-${group.id}`}
                  className="search-item"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <img
                    src={`${API_BASE_URL}/${group.avatar}`}
                    alt=""
                    className="img-avt"
                  />
                  <span>{group.name}</span>
                  <span className="group-label"> Hội nhóm </span>
                </div>
              ))}
            </>
          ) : (
            <p>Không tìm thấy kết quả</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
