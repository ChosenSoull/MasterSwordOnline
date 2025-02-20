$(document).ready(function () {
    function getFileModificationTime(url, callback) {
        fetch(url, { method: 'HEAD' })
            .then(response => {
                let lastModified = response.headers.get("Last-Modified");
                if (lastModified) {
                    let date = new Date(lastModified);
                    let formattedDate = date.getDate().toString().padStart(2, '0') + '.' + (date.getMonth() + 1).toString().padStart(2, '0') + '.' + date.getFullYear() + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
                    callback(url.replace(location.origin + '/', ''), formattedDate);
                }
            });
    }

    function checkForUpdates() {
        let files = {};
        let pendingRequests = 0;

        function sendUpdateRequest() {
            if (pendingRequests === 0) {
                $.ajax({
                    url: 'autoupdate.php',
                    type: 'POST',
                    data: { files: JSON.stringify(files) },
                    dataType: 'json',
                    success: function (response) {
                        if (response.updated) {
                            response.updated.forEach(file => {
                                if (file in response.files) {
                                    let decodedContent = atob(response.files[file]);
                                    localStorage.setItem(file, decodedContent);
                                    location.reload();
                                }
                            });
                        }
                        if (response.deleted) {
                            response.deleted.forEach(file => {
                                localStorage.removeItem(file);
                                location.reload();
                            });
                        }
                    }
                });
            }
        }

        $("script[src], link[rel='stylesheet']").each(function () {
            let url = $(this).attr("src") || $(this).attr("href");
            if (url) {
                pendingRequests++;
                getFileModificationTime(url, (file, time) => {
                    files[file] = time;
                    pendingRequests--;
                    sendUpdateRequest();
                });
            }
        });

        let url = window.location.pathname;
        pendingRequests++;
        getFileModificationTime(url, (file, time) => {
            files[file] = time;
            pendingRequests--;
            sendUpdateRequest();
        });
    }

    setInterval(checkForUpdates, 5000);
});
