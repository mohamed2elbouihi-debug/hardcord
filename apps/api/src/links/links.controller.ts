import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import net from "net";

@ApiTags("links")
@Controller("links")
export class LinksController {
  @Get("preview")
  async preview(@Query("url") url: string) {
    const target = new URL(url);
    if (!['http:', 'https:'].includes(target.protocol)) {
      return { error: "Unsupported protocol" };
    }

    const hostname = target.hostname;
    if (hostname === "localhost" || hostname.endsWith(".local")) {
      return { error: "Blocked host" };
    }
    if (net.isIP(hostname)) {
      const octets = hostname.split(".").map(Number);
      const isPrivate =
        octets[0] === 10 ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
        (octets[0] === 192 && octets[1] === 168) ||
        octets[0] === 127;
      if (isPrivate) {
        return { error: "Blocked host" };
      }
    }

    const response = await fetch(target.toString(), { method: "GET", redirect: "follow" });
    const html = await response.text();
    const match = html.match(/<title>(.*?)<\/title>/i);
    return { title: match?.[1] ?? null, url: target.toString() };
  }
}
