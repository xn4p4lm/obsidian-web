import Handlebars from "handlebars";
import {
  SandboxRequest,
  SandboxRenderResponse,
  SandboxRenderRequest,
} from "./types";

const render = (request: SandboxRenderRequest): SandboxRenderResponse => {
  const compiled = Handlebars.compile(request.template);

  return {
    success: true,
    request,
    rendered: compiled(request.context),
  };
};

function handleEvent(evt: MessageEvent<SandboxRequest>): void {
  const command = evt.data.command;

  const debug = document.getElementById("debug");
  if (debug) {
    debug.innerHTML = JSON.stringify(evt.data);
  }

  try {
    switch (command) {
      case "render":
        (evt.source as WindowProxy).postMessage(render(evt.data), evt.origin);
        break;
      default:
        throw new Error(`Unexpected command: ${command}`);
    }
  } catch (e) {
    (evt.source as WindowProxy).postMessage(
      {
        success: false,
        request: evt.data,
        message: (e as Error).message,
      },
      evt.origin
    );
  }
}

window.addEventListener("message", handleEvent);
window.parent.postMessage({ loaded: true }, "*");