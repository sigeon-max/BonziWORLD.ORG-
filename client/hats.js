(function () {
    var HATS = {
        police: "./img/hats/police.webp",
        chain: "./img/hats/chain.webp",
        cigar: "./img/hats/cigar.webp",
        obama: "./img/hats/obama.webp",
        witch: "./img/hats/witch.webp",
        eyebrows: "./img/hats/eyebrows.webp",
        bucket: "./img/hats/bucket.webp",
        tophat: "./img/hats/tophat.webp"
    };

    function bonziSize() {
        try {
            if (window.BonziData && window.BonziData.size) return window.BonziData.size;
        } catch (e) {}
        return { x: 200, y: 160 };
    }

    function getHatSettings() {
        try {
            var x = localStorage.getItem("bw_hat_x");
            var y = localStorage.getItem("bw_hat_y");
            var size = localStorage.getItem("bw_hat_size");
            return {
                x: x !== null ? Number(x) : 0,
                y: y !== null ? Number(y) : 0,
                size: size !== null ? Number(size) : 100
            };
        } catch (e) {}
        return { x: 0, y: 0, size: 100 };
    }

    function applyHats() {
        if (typeof window.usersPublic === "undefined") return;
        var size = bonziSize();
        var hatSettings = getHatSettings();
        var hatSizePercent = hatSettings.size / 100;
        var hatWidth = size.x * hatSizePercent;
        var hatHeight = size.y * hatSizePercent;

        Object.keys(window.usersPublic).forEach(function (guid) {
            var u = window.usersPublic[guid];
            var $bonzi = $("#bonzi_" + guid);
            if (!$bonzi.length) return;
            if ($bonzi.css("position") === "static") $bonzi.css("position", "relative");

            var $bless = $bonzi.children(".bonzi_blessed");
            if (u && u.color === "blessed") {
                if (!$bless.length) {
                    $bless = $("<img class='bonzi_blessed' alt='' src='./img/bonzi/blessed.png'>").css({
                        position: "absolute",
                        left: 0, top: 0,
                        width: size.x + "px",
                        height: size.y + "px",
                        pointerEvents: "none",
                        zIndex: 4,
                        mixBlendMode: "screen"
                    });
                    $bonzi.append($bless);
                }
            } else if ($bless.length) {
                $bless.remove();
            }

            var $hat = $bonzi.children(".bonzi_hat");
            if (u && u.hat && HATS[u.hat]) {
                if (!$hat.length) {
                    $hat = $("<img class='bonzi_hat' alt=''>").css({
                        position: "absolute",
                        left: hatSettings.x + "px",
                        top: hatSettings.y + "px",
                        width: hatWidth + "px",
                        height: hatHeight + "px",
                        pointerEvents: "none",
                        zIndex: 5
                    });
                    $bonzi.append($hat);
                } else {
                    // Update positioning/sizing if settings changed
                    $hat.css({
                        left: hatSettings.x + "px",
                        top: hatSettings.y + "px",
                        width: hatWidth + "px",
                        height: hatHeight + "px"
                    });
                }
                if ($hat.attr("src") !== HATS[u.hat]) $hat.attr("src", HATS[u.hat]);
            } else if ($hat.length) {
                $hat.remove();
            }
        });
    }

    function hookSocket() {
        if (typeof window.socket === "undefined") {
            return setTimeout(hookSocket, 100);
        }
        window.socket.on("updateAll", function () { setTimeout(applyHats, 60); });
        window.socket.on("update", function () { setTimeout(applyHats, 60); });
        window.socket.on("hat", function (d) {
            if (d && d.guid && window.usersPublic && window.usersPublic[d.guid]) {
                if (d.hat) window.usersPublic[d.guid].hat = d.hat;
                else delete window.usersPublic[d.guid].hat;
            }
            setTimeout(applyHats, 60);
        });
        window.socket.on("hat_settings_updated", function () { setTimeout(applyHats, 60); });
        setInterval(applyHats, 1500);
    }

    $(hookSocket);
})();
