chrome.tabs.getSelected(null, function (tab) {
  var currentURL = tab.url;
  var url = new URL(tab.url);
  var hostname = url.hostname;

  const cleanHost = (host) => {
    host = host.replace(/^https:\/\//g, "");
    host = host.replace(/^http:\/\//g, "");
    host = host.replace(/\/.*/g, "");
    return host;
  };

  const cleanHosts = (hosts) => {
    for (let i = 0; i < hosts.length; i++) {
      hosts[i] = hosts[i].replace(/^https:\/\//g, "");
      hosts[i] = hosts[i].replace(/^http:\/\//g, "");
      hosts[i] = hosts[i].replace(/\/.*/g, "");
    }
    return hosts;
  };

  (function () {
    var DEFAULT_OPTIONS = {
      exclude: "",
    };
    var storageKey = "SAR";

    var vm = new Vue({
      el: "#app",
      data: {
        power: true,
        scripts: [],
        options: {
          exclude: "",
        },
      },
      ready() {
        var data = JSON.parse(localStorage.getItem(storageKey));
        if (data) {
          this.$set("power", data.power);
          this.$set("scripts", data.scripts);
          if (data.options) {
            this.$set("options", data.options);
          }
        } else {
          this.$set("power", true);
          this.$set("scripts", []);
          this.$set("options", DEFAULT_OPTIONS);
        }
      },
      methods: {
        togglePower() {
          this.power = !this.power;
          this.save();
        },
        toggle(index) {
          var script = this.scripts[index];
          script.enable = !script.enable;
          this.save();
        },
        _setStorage(data) {
          window.localStorage.setItem(storageKey, JSON.stringify(data));
        },
        save() {
          this._setStorage(this.$data);
        },
        isMatch(host) {
          if (this.isExcludeHost()) {
            return false;
          }
          if (host === "" || host === "any") {
            return true;
          }
          var hosts, match;
          if (host.indexOf(",") !== -1) {
            hosts = cleanHosts(host.split(","));
            match = hosts.some((_host) => {
              return hostname.indexOf(_host.trim()) !== -1;
            });
          } else {
            host = cleanHost(host);
            match = hostname.indexOf(host) !== -1;
          }
          return match;
        },
        isExcludeHost() {
          var host = this.options.exclude;
          if (host === "") {
            return false;
          }
          var hosts, match;
          if (host.indexOf(",") !== -1) {
            hosts = cleanHosts(host.split(","));
            match = hosts.some((_host) => {
              return hostname.indexOf(_host.trim()) !== -1;
            });
          } else {
            host = cleanHost(host);
            match = hostname.indexOf(host) !== -1;
          }
          return match;
        },
        count() {
          var matched = this.scripts.filter((script) => {
            return this.isMatch(script.host);
          });
          return matched.length === 0 ? true : false;
        },
        openOption() {
          var fileName = "options.html";
          var url = chrome.extension.getURL(fileName);
          chrome.tabs.create({
            url: url,
          });
        },
      },
    });
  })();
});
