package com.wshake.common.util;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 从 User-Agent 解析浏览器 / 操作系统 / 设备（对齐 Go mileusna/useragent 与 mock {@code parseUserAgent}）。
 *
 * <p>供登录日志、API 日志等写入 browser_name / os_name / client_name。
 *
 * @author wshake
 */
public final class UserAgentParser {

    private static final Pattern EDGE = Pattern.compile("Edg(?:e|A|iOS)?/([\\d.]+)");
    private static final Pattern CHROME = Pattern.compile("Chrome/([\\d.]+)");
    private static final Pattern FIREFOX = Pattern.compile("Firefox/([\\d.]+)");
    private static final Pattern SAFARI = Pattern.compile("Version/([\\d.]+).*Safari");
    private static final Pattern WINDOWS = Pattern.compile("Windows NT ([\\d.]+)");
    private static final Pattern MAC = Pattern.compile("Mac OS X ([\\d_]+)");
    private static final Pattern ANDROID = Pattern.compile("Android ([\\d.]+)");
    private static final Pattern IOS = Pattern.compile("OS ([\\d_]+) like Mac OS X");
    private static final Pattern LINUX = Pattern.compile("Linux");

    private UserAgentParser() {}

    /**
     * 解析结果。
     *
     * @param browserName    浏览器名
     * @param browserVersion 浏览器版本
     * @param osName         操作系统名
     * @param osVersion      操作系统版本
     * @param device         设备型号（若 UA 可识别）
     * @param desktop        是否桌面端
     */
    public record Parsed(
            String browserName,
            String browserVersion,
            String osName,
            String osVersion,
            String device,
            boolean desktop) {

        public static Parsed empty() {
            return new Parsed("", "", "", "", "", false);
        }

        /**
         * 客户端展示名：优先设备型号；桌面且无设备时为 {@code PC}（对齐 Go login_logger）。
         */
        public String clientName() {
            if (device != null && !device.isBlank()) {
                return device;
            }
            if (desktop) {
                return "PC";
            }
            return "";
        }
    }

    public static Parsed parse(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return Parsed.empty();
        }
        String ua = userAgent;

        String browserName = "";
        String browserVersion = "";
        Matcher edge = EDGE.matcher(ua);
        Matcher chrome = CHROME.matcher(ua);
        Matcher firefox = FIREFOX.matcher(ua);
        Matcher safari = SAFARI.matcher(ua);
        if (edge.find()) {
            browserName = "Edge";
            browserVersion = edge.group(1);
        } else if (chrome.find()) {
            browserName = "Chrome";
            browserVersion = chrome.group(1);
        } else if (firefox.find()) {
            browserName = "Firefox";
            browserVersion = firefox.group(1);
        } else if (safari.find()) {
            browserName = "Safari";
            browserVersion = safari.group(1);
        } else {
            browserName = "Unknown";
        }

        String osName = "";
        String osVersion = "";
        Matcher win = WINDOWS.matcher(ua);
        Matcher mac = MAC.matcher(ua);
        Matcher android = ANDROID.matcher(ua);
        Matcher ios = IOS.matcher(ua);
        if (win.find()) {
            osName = "Windows";
            String ver = win.group(1);
            osVersion = "10.0".equals(ver) ? "10/11" : ver;
        } else if (mac.find()) {
            osName = "macOS";
            osVersion = mac.group(1).replace('_', '.');
        } else if (android.find()) {
            osName = "Android";
            osVersion = android.group(1);
        } else if (ios.find()) {
            osName = "iOS";
            osVersion = ios.group(1).replace('_', '.');
        } else if (LINUX.matcher(ua).find()) {
            osName = "Linux";
        }

        String lower = ua.toLowerCase(Locale.ROOT);
        String device = detectDevice(ua, lower);
        boolean mobile = isMobile(lower, osName);
        boolean desktop = !mobile && ("Windows".equals(osName) || "macOS".equals(osName) || "Linux".equals(osName));

        return new Parsed(
                nullToEmpty(browserName),
                nullToEmpty(browserVersion),
                nullToEmpty(osName),
                nullToEmpty(osVersion),
                nullToEmpty(device),
                desktop);
    }

    private static String detectDevice(String ua, String lower) {
        if (lower.contains("ipad")) {
            return "iPad";
        }
        if (lower.contains("iphone")) {
            return "iPhone";
        }
        if (lower.contains("ipod")) {
            return "iPod";
        }
        // Android 常见型号片段：; Pixel 7 Build/ 或 ; SM-G991B
        if (lower.contains("android")) {
            Matcher m = Pattern.compile(";\\s*([^;)]+?)\\s+Build/").matcher(ua);
            if (m.find()) {
                String model = m.group(1).trim();
                if (!model.isEmpty() && !"wv".equalsIgnoreCase(model) && !model.equalsIgnoreCase("Linux")) {
                    return model;
                }
            }
            return "Android";
        }
        return "";
    }

    private static boolean isMobile(String lower, String osName) {
        if ("Android".equals(osName) || "iOS".equals(osName)) {
            return true;
        }
        return lower.contains("mobile")
                || lower.contains("iphone")
                || lower.contains("ipad")
                || lower.contains("android");
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
