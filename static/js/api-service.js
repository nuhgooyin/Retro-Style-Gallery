let apiService = (function () {
  "use strict";

  const module = {};

  //
  // Get posts given a timestamp and "direction" (direction indicates whether posts after or before timestamp are returned)
  //
  module.getPosts = function (timestamp, direction) {
    return fetch(`/posts/?timestamp=${timestamp}&direction=${direction}`, {
      method: "GET",
    }).then((res) => res.json());
  };

  //
  // Get comments under a post given a postId, timestamp and "direction" (direction indicates whether comments after or before timestamp are returned (incl.))
  //
  module.getComments = function (postId, timestamp, direction) {
    return fetch(
      `/comments/${postId}/?timestamp=${timestamp}&direction=${direction}`,
      {
        method: "GET",
      },
    ).then((res) => res.json());
  };

  //
  // Get posts count
  //
  module.getPostsCount = function () {
    return fetch("/posts/count", {
      method: "GET",
    }).then((res) => res.json());
  };

  //
  // Add post
  //
  module.addPost = function (formData) {
    return fetch("/posts", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  };

  //
  // Add comment to a post (given postId)
  //
  module.addComment = function (formData, postId) {
    return fetch(`/comments/${postId}`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  };

  //
  // Delete post given its id
  //
  module.deletePost = function (id) {
    return fetch(`/posts/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  //
  // Delete comment given its id
  //
  module.deleteComment = function (commentId) {
    return fetch(`/comments/${commentId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  return module;
})();
