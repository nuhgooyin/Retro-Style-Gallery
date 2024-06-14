(function () {
  "use strict";

  let currPostTS = null;
  let currPostPK = null;
  let currGalleryInd = null;
  let currSize = null;
  let firstComment = null;
  let lastComment = null;

  //
  //  Open/close Add Image Form
  //
  function openCloseUploadBtn() {
    let found = 0;
    document.getElementById("upload-btn").classList.forEach((classElement) => {
      if (classElement === "upload-icon-opened") {
        found = 1;
      }
    });

    if (found === 1) {
      document.getElementById("upload-btn").src = "./media/upload-icon.png";
      document
        .getElementById("upload-btn")
        .classList.remove("upload-icon-opened");
      document
        .getElementById("add-image-form")
        .classList.remove("display-add-image-form");
    } else {
      document.getElementById("upload-btn").src = "./media/cross-icon.png";
      document.getElementById("upload-btn").classList.add("upload-icon-opened");
      document
        .getElementById("add-image-form")
        .classList.add("display-add-image-form");
    }
  }

  //
  //  Open/close Add Comment Form
  //
  function openCloseCommentForm() {
    let found = 0;
    document
      .getElementById("comment-post-btn")
      .classList.forEach((classElement) => {
        if (classElement === "upload-icon-opened") {
          found = 1;
        }
      });

    if (found === 1) {
      document.getElementById("comment-post-btn").style.backgroundImage =
        "url(./media/chat-icon.png)";
      document
        .getElementById("comment-post-btn")
        .classList.remove("upload-icon-opened");
      document
        .getElementById("make-comment-form")
        .classList.remove("comment-form-opened");
    } else {
      document.getElementById("comment-post-btn").style.backgroundImage =
        "url(./media/cross-icon.png)";
      document
        .getElementById("comment-post-btn")
        .classList.add("upload-icon-opened");
      document
        .getElementById("make-comment-form")
        .classList.add("comment-form-opened");
    }
  }

  //
  //  Add image/post to gallery
  //
  function addPost(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    document.querySelector("#post-submit-btn").disabled = true;
    displayLoadingScreen();
    apiService.addPost(formData).then(() => {
      document.querySelector("#post-submit-btn").disabled = false;
      currSize++;
      if (currPostPK !== null) {
        currGalleryInd = currSize + 1;
        displayInd(Date.now(), "prev");
      } else {
        displayInd(Date.now(), "curr");
      }
    });

    e.target.reset();
  }

  //
  // Update display post to given timestamp and direction (next, prev, or curr)
  //
  function displayInd(timestamp, direction) {
    apiService.getPosts(timestamp, direction).then((post) => {
      if (post !== null) {
        currPostTS = post.createdAt;
        currPostPK = post.id;
        firstComment = null;
        lastComment = null;

        if (direction === "next") {
          currGalleryInd++;
        } else if (direction === "prev") {
          currGalleryInd--;
        } else {
          currGalleryInd = 1;
        }

        document.getElementById("image-title").innerText = post.title;
        document.getElementById("num-in-gallery").innerText =
          "#" + currGalleryInd + "/" + currSize;
        document.getElementById("image-display").src =
          `/posts/${post.id}/image`;
        document.getElementById("image-author").innerHTML =
          "<i>Posted on " + post.date + " by:</i> " + post.author;
        document
          .getElementById("outer-img-display")
          .classList.add("display-outer-img");
        document
          .getElementById("gallery-empty")
          .classList.add("hide-gallery-empty-msg");
        document
          .getElementById("comment-sec-controls")
          .classList.add("display-comment-sec-controls");
        document
          .getElementById("comments")
          .classList.add("display-comment-section");
        updateComments();
      } else {
        document
          .getElementById("outer-img-display")
          .classList.remove("display-outer-img");
        document
          .getElementById("gallery-empty")
          .classList.remove("hide-gallery-empty-msg");
        document
          .getElementById("comment-sec-controls")
          .classList.remove("display-comment-sec-controls");
        document
          .getElementById("comments")
          .classList.remove("display-comment-section");
        document
          .getElementById("make-comment-form")
          .classList.remove("comment-form-opened");
        currPostPK = null;
        currPostTS = null;
        currSize = 0;
        currGalleryInd = null;
      }
      hideLoadingScreen();
    });
  }

  //
  // Update display to next image in gallery
  //
  function nextImg() {
    displayLoadingScreen();
    apiService.getPosts(currPostTS, "next").then((post) => {
      if (post !== null) {
        displayInd(currPostTS, "next");
      }
      hideLoadingScreen();
    });
  }

  //
  // Update display to back/previous image in gallery
  //
  function backImg() {
    displayLoadingScreen();
    apiService.getPosts(currPostTS, "prev").then((post) => {
      if (post !== null) {
        displayInd(currPostTS, "prev");
      }
      hideLoadingScreen();
    });
  }

  //
  // Delete an image in the gallery
  //
  function deleteImg() {
    currSize--;
    currGalleryInd--;
    displayLoadingScreen();
    apiService.deletePost(currPostPK).then(() => {
      apiService.getPosts(currPostTS, "next").then((post) => {
        if (post !== null) {
          displayInd(currPostTS, "next");
        } else {
          apiService.getPosts(currPostTS, "prev").then((post) => {
            if (post !== null) {
              displayInd(currPostTS, "prev");
              currGalleryInd++;
            } else {
              displayInd(currPostTS, "curr");
            }
          });
        }
      });
    });
  }

  //
  // Update comments displayed on image in gallery
  //
  function updateComments() {
    document.querySelector("#comments").innerHTML = "";

    let direction = "first";
    let commentTS = null;

    if (firstComment !== null) {
      direction = "next";
      commentTS = firstComment.createdAt;
    }

    displayLoadingScreen();
    apiService
      .getComments(currPostPK, commentTS, direction)
      .then((comments) => {
        if (comments.length !== 0) {
          firstComment = comments[0];

          if (comments.length === 11) {
            lastComment = comments[comments.length - 2];
          } else {
            lastComment = comments[comments.length - 1];
          }

          for (let i = 0; i < comments.length && i < 10; i++) {
            let currComment = comments[i];
            let elmt = document.createElement("div");
            elmt.className = "row";
            elmt.id = currComment.id;
            elmt.innerHTML = `
                    <div class="col-1 col-sm-1">
                        <img class="comment-profile-pic" src="./media/profile-picture-sample.png" alt="Sample of a user's profile picture.">
                        <div class="comment-author">${currComment.author}</div>
                        <div class="comment-date">Posted: ${currComment.date}</div>
                    </div>
                    <div class="col-auto col-sm-auto">
                        <div class="comment-content">${currComment.content}</div>
                    </div>
                    <div class="col-1 col-sm-1 upvote-icon"></div>
                    <div class="col-1 col-sm-1 delete-icon"></div>
                    <div class="comment-spacer"></div>
                  `;
            elmt
              .querySelector(".delete-icon")
              .addEventListener("click", function (event) {
                displayLoadingScreen();
                event.preventDefault();

                apiService.deleteComment(currComment.id).then(() => {
                  if (currComment.id === firstComment.id) {
                    firstComment = null;
                  }
                  if (currComment.id === lastComment.id) {
                    lastComment = null;
                  }
                  updateComments();
                });
              });
            document.querySelector("#comments").append(elmt);
          }
        }
        hideLoadingScreen();
      });
  }

  //
  // Add a comment to an image in the gallery
  //
  function addComment(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    document.querySelector("#make-comment-form").disabled = true;
    displayLoadingScreen();
    apiService.addComment(formData, currPostPK).then(() => {
      document.querySelector("#make-comment-form").disabled = false;
      updateComments();
    });

    event.target.reset();
  }

  //
  // Going to the next 10 comments
  //
  function nextComment() {
    if (lastComment !== null && lastComment !== undefined) {
      displayLoadingScreen();
      apiService
        .getComments(currPostPK, lastComment.createdAt, "next")
        .then((comments) => {
          if (comments !== null && comments.length >= 2) {
            firstComment = comments[1];
            lastComment = comments[comments.length - 1];
            updateComments();
          }
          hideLoadingScreen();
        });
    }
  }

  //
  // Going back 10 comments
  //
  function backComment() {
    if (firstComment !== null && firstComment !== undefined) {
      displayLoadingScreen();
      apiService
        .getComments(currPostPK, firstComment.createdAt, "prev")
        .then((comments) => {
          if (comments !== null && comments.length >= 2) {
            lastComment = comments[1];
            firstComment = comments[comments.length - 1];
            updateComments();
          }
          hideLoadingScreen();
        });
    }
  }

  //
  //  Display loading screen
  //
  function displayLoadingScreen() {
    document.querySelector("#loadingScreen").classList.remove("hidden");
  }

  //
  //  Hide loading screen
  //
  function hideLoadingScreen() {
    document.querySelector("#loadingScreen").classList.add("hidden");
  }

  //
  //  Add the appropriate handlers and init posts
  //
  window.addEventListener("load", function () {
    displayLoadingScreen();

    document
      .querySelector("#upload-btn")
      .addEventListener("click", openCloseUploadBtn);
    document
      .querySelector("#comment-post-btn")
      .addEventListener("click", openCloseCommentForm);
    document
      .querySelector("#add-image-form")
      .addEventListener("submit", addPost);
    document.querySelector("#next-post").addEventListener("click", nextImg);
    document.querySelector("#back-post").addEventListener("click", backImg);
    document.querySelector("#delete-post").addEventListener("click", deleteImg);
    document
      .querySelector("#make-comment-form")
      .addEventListener("submit", addComment);
    document
      .querySelector("#next-comment-10")
      .addEventListener("click", nextComment);
    document
      .querySelector("#back-comment-10")
      .addEventListener("click", backComment);

    apiService.getPostsCount().then((count) => {
      currSize = count;
      displayInd(Date.now(), "curr");
      hideLoadingScreen();
    });
  });
})();
