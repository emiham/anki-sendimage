async function sendToAnki(imageUrl) {
  function invoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener("error", () => reject("failed to issue request"));
      xhr.addEventListener("load", () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (Object.getOwnPropertyNames(response).length != 2) {
            throw "response has an unexpected number of fields";
          }
          if (!response.hasOwnProperty("error")) {
            throw "response is missing required error field";
          }
          if (!response.hasOwnProperty("result")) {
            throw "response is missing required result field";
          }
          if (response.error) {
            throw response.error;
          }
          resolve(response.result);
        } catch (e) {
          reject(e);
        }
      });

      xhr.open("POST", "http://127.0.0.1:8765");
      xhr.send(JSON.stringify({ action, version, params }));
    });
  }

  invoke("guiCurrentCard", 6, {}).then((card) => {
    invoke("findNotes", 6, { query: `cid:${card.cardId}` }).then((noteIds) => {
      invoke("updateNoteFields", 6, {
        note: {
          id: noteIds[0],
          fields: {
            Image: "",
          },
          picture: [
            {
              url: imageUrl,
              filename: "_send-image.jpg",
              deleteExisting: false,
              fields: ["Image"],
            },
          ],
        },
      }).then((res) => {
        console.log(res);
      });
    });
  });
}
