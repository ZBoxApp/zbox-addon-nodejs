/**
 * Created by enahum on 2/10/16.
 */

function closeModal() {
    var parser = document.createElement('a');
    parser.href = document.referrer;
    window.parent.postMessage('close', '*');
}
