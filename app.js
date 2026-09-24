function api(action, params = {}) {
  const MAX_RETRY = 3;
  const RETRY_DELAY = 1200;
  const TIMEOUT = 20000;

  function attempt(attemptNumber) {
    return new Promise((resolve, reject) => {

      const cb =
        "osisCb_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2);

      const script = document.createElement("script");

      const q = new URLSearchParams({
        action: action,
        callback: cb,
        _ts: String(Date.now())
      });

      Object.keys(params).forEach(key => {
        q.set(key, params[key] ?? "");
      });

      let finished = false;
      let timer = null;

      function cleanup() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }

        try {
          delete window[cb];
        } catch (e) {}

        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }

      function fail(message) {
        if (finished) return;

        finished = true;
        cleanup();

        if (attemptNumber < MAX_RETRY) {

          setTimeout(() => {

            attempt(attemptNumber + 1)
              .then(resolve)
              .catch(reject);

          }, RETRY_DELAY);

        } else {

          reject(new Error(message));

        }
      }

      window[cb] = function(data) {

        if (finished) return;

        finished = true;
        cleanup();

        resolve(data);

      };

      script.onerror = function() {

        fail(
          "Gagal menghubungi server setelah 3 percobaan."
        );

      };

      script.src =
        C.API_URL +
        "?" +
        q.toString();

      document.body.appendChild(script);

      timer = setTimeout(() => {

        fail(
          "Server tidak merespons setelah 3 percobaan."
        );

      }, TIMEOUT);

    });
  }

  return attempt(1);
}
