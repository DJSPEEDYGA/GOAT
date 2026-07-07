"use client";

import Image from "next/image";
import { useState } from "react";

const integrations = [
	{
		name: "@kubiks/otel-drizzle",
		description: "OpenTelemetry instrumentation for Drizzle ORM",
		npm: "https://www.npmjs.com/package/@kubiks/otel-drizzle",
		github: "https://github.com/kubiks-inc/otel/tree/main/packages/otel-drizzle",
		status: "available",
	},
	{
		name: "@kubiks/otel-better-auth",
		description: "OpenTelemetry instrumentation for Better Auth",
		npm: "https://www.npmjs.com/package/@kubiks/otel-better-auth",
		github: "https://github.com/kubiks-inc/otel/tree/main/packages/otel-better-auth",
		status: "available",
	},
	{
		name: "@kubiks/otel-resend",
		description: "OpenTelemetry instrumentation for Resend",
		npm: "https://www.npmjs.com/package/@kubiks/otel-resend",
		github: "https://github.com/kubiks-inc/otel/tree/main/packages/otel-resend",
		status: "available",
	},
	{
		name: "@kubiks/otel-autumn",
		description: "OpenTelemetry instrumentation for Autumn",
		npm: "https://www.npmjs.com/package/@kubiks/otel-autumn",
		github: "https://github.com/kubiks-inc/otel/tree/main/packages/otel-autumn",
		status: "available",
	},
	{
		name: "@kubiks/otel-upstash-queues",
		description: "OpenTelemetry instrumentation for Upstash Queues",
		npm: "https://www.npmjs.com/package/@kubiks/otel-upstash-queues",
		github: "https://github.com/kubiks-inc/otel/tree/main/packages/otel-upstash-queues",
		status: "available",
	},
];

const features = [
	{
		title: "Real-time Dashboards",
		description:
			"Monitor your entire application with customizable dashboards. Track requests, errors, performance metrics, and more in real-time.",
	},
	{
		title: "Distributed Tracing",
		description:
			"Follow requests across your entire stack. See database queries, API calls, and third-party integrations in a single trace view.",
	},
	{
		title: "Error Tracking",
		description:
			"Automatic error detection and grouping with full stack traces. Get notified immediately when issues occur in production.",
	},
	{
		title: "Performance Analytics",
		description:
			"Track latency, throughput, and error rates. Identify bottlenecks with p50, p95, and p99 metrics.",
	},
];

const screenshots = [
	{
		image: "/feat-dashboard.png",
		alt: "Kubiks dashboard showing real-time metrics",
	},
	{
		image: "/feat-trace-view.png",
		alt: "Kubiks trace view showing distributed tracing",
	},
];

export default function Home() {
	const [currentScreenshot, setCurrentScreenshot] = useState(0);

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<main className="container mx-auto px-4 py-16 md:py-24">
				<div className="flex flex-col items-center text-center gap-8 mb-20">
					<div className="flex items-center gap-6 mb-4">
						{/* Kubiks Logo + Text */}
						<div className="flex items-center gap-3">
							<Image
								src="/kubiks.svg"
								alt="Kubiks logo"
								width={48}
								height={48}
								priority
							/>
							<span className="text-2xl font-semibold">Kubiks</span>
						</div>
						
						{/* Plus Sign */}
						<span className="text-2xl text-foreground/40">+</span>
						
						{/* Vercel Logotype */}
						<div className="flex items-center">
							<Image
								src="/vercel-logotype-dark.svg"
								alt="Vercel"
								width={120}
								height={28}
								priority
								className="hidden dark:block"
							/>
							<Image
								src="/vercel-logotype-light.svg"
								alt="Vercel"
								width={120}
								height={28}
								priority
								className="block dark:hidden"
							/>
						</div>
					</div>
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
						Next.js with{" "}
						<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							Kubiks
						</span>
					</h1>
					<p className="text-lg md:text-xl text-foreground/70 max-w-2xl">
						This template has the minimal configuration to make use of the Kubiks integration. Get deep insights into
						performance, errors, and user experience with OpenTelemetry-native instrumentation.
					</p>
					<div className="flex gap-4 flex-col sm:flex-row mt-4">
						<a
							href="https://vercel.com/new/clone?repository-url=https://github.com/kubiks-inc/nextjs-starter-kubiks&integration-ids=oac_2wJzHeC4AgDFmeeiknGF9uq1"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-lg border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-base h-12 px-6"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2L2 19.7778h20L12 2z"/>
							</svg>
							Deploy on Vercel
						</a>
						<a
							href="https://docs.kubiks.ai"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-base h-12 px-6"
						>
							View Documentation
						</a>
					</div>
				</div>

				{/* Platform Features - INTERACTIVE SHOWCASE */}
				<div className="mb-20">
					<h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
						Complete Observability
					</h2>
					<p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
						Everything you need to monitor, debug, and optimize your Node.js applications.
					</p>
					
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
						{/* Feature List - LEFT SIDE */}
						<div className="space-y-4">
							{features.map((feature, index) => (
								<div
									key={index}
									className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-5"
								>
									<h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
									<p className="text-sm text-foreground/60">{feature.description}</p>
								</div>
							))}
						</div>

						{/* Screenshot Slideshow - RIGHT SIDE */}
						<div className="rounded-lg border border-black/[.08] dark:border-white/[.145] overflow-hidden bg-[#fafafa] dark:bg-[#111] p-6">
							<div className="rounded-lg overflow-hidden border border-black/[.08] dark:border-white/[.145] shadow-lg relative mb-6">
								<Image
									src={screenshots[currentScreenshot].image}
									alt={screenshots[currentScreenshot].alt}
									width={1200}
									height={800}
									className="w-full h-auto"
									loading="lazy"
								/>

								{/* Previous/Next Buttons */}
								<button
									onClick={() =>
										setCurrentScreenshot((prev) =>
											prev === 0 ? screenshots.length - 1 : prev - 1
										)
									}
									className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-2 transition-colors"
									aria-label="Previous screenshot"
								>
									<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M15 18l-6-6 6-6"/>
									</svg>
								</button>
								<button
									onClick={() =>
										setCurrentScreenshot((prev) =>
											prev === screenshots.length - 1 ? 0 : prev + 1
										)
									}
									className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-2 transition-colors"
									aria-label="Next screenshot"
								>
									<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M9 18l6-6-6-6"/>
									</svg>
								</button>
							</div>

							<a
								href="https://kubiks.app"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-6 w-full"
							>
								Explore Platform
								<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M5 12h14M12 5l7 7-7 7"/>
								</svg>
							</a>
						</div>
					</div>
				</div>

				{/* Drop-in Integrations + AI Demo - SIDE BY SIDE */}
				<div className="mb-20">
					<h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
						Drop-in Integrations
					</h2>
					<p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
						Add automatic tracing to popular tools with a single line of code. All
						integrations are open source and MIT licensed.
					</p>
					
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* AI Installation Demo - LEFT SIDE (2/3 width) */}
						<div className="lg:col-span-2 rounded-lg border border-black/[.08] dark:border-white/[.145] p-6 bg-[#fafafa] dark:bg-[#111]">
							<h3 className="font-semibold text-lg mb-3">
								Install with AI in Seconds
							</h3>
							<p className="text-sm text-foreground/60 mb-6">
								After deploying, our AI automatically installs and configures integrations for your stack based on what you&apos;re using.
							</p>
							<div className="rounded-lg overflow-hidden border border-black/[.08] dark:border-white/[.145] shadow-lg">
								<Image
									src="/install-with-kubiks.png"
									alt="Kubiks AI automatically installing integrations"
									width={1200}
									height={800}
									className="w-full h-auto"
									loading="lazy"
								/>
							</div>
						</div>

						{/* Integrations List - RIGHT SIDE (1/3 width) */}
						<div className="lg:col-span-1 space-y-4">
							{integrations.slice(0, 5).map((integration) => (
								<div
									key={integration.name}
									className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-4 hover:bg-[#fafafa] dark:hover:bg-[#111] transition-colors"
								>
									<h3 className="font-mono font-semibold text-sm mb-1">
										{integration.name}
									</h3>
									<p className="text-xs text-foreground/60 mb-3">
										{integration.description}
									</p>
									<div className="flex gap-3 text-xs">
										<a
											href={integration.npm}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400"
										>
											<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
												<path d="M0 0v24h24V0H0zm21.3 18.2h-6.2v-3.1H12v3.1H2.7V5.8h18.6v12.4z" fill="#CB3837"/>
											</svg>
											npm
										</a>
										<a
											href={integration.github}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400"
										>
											<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
												<path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" className="fill-foreground"/>
											</svg>
											GitHub
										</a>
									</div>
								</div>
							))}
							<div className="rounded-lg border border-dashed border-black/[.08] dark:border-white/[.145] p-4 text-center">
								<p className="text-xs text-foreground/60 mb-2">
									View all integrations and contribute new ones
								</p>
								<a
									href="https://docs.kubiks.ai"
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
								>
									Browse Documentation →
								</a>
							</div>
						</div>
					</div>
				</div>

			</main>

			{/* Footer */}
			<footer className="border-t border-black/[.08] dark:border-white/[.145] py-8">
				<div className="container mx-auto px-4 text-center text-sm text-foreground/60">
					<p>
						Built with ❤️ by{" "}
						<a
							href="https://kubiks.ai"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors"
						>
							Kubiks
						</a>
					</p>
				</div>
			</footer>
		</div>
	);
}
