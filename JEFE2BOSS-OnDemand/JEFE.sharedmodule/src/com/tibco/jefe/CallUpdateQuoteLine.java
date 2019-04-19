package com.tibco.jefe;

import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.BufferedReader;

public class CallUpdateQuoteLine {
	
	public static String InvokePOSTRequest(String strURL, String jsonBody) {
		String strReturn = "";
		System.out.println("\n URL .... ");
		System.out.println(strURL);
		System.out.println("\n JSON String .... ");
		System.out.println(jsonBody);
		
		try {
			URL url = new URL(strURL);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setDoOutput(true);
			conn.setRequestMethod("POST");
			conn.setRequestProperty("Content-Type", "application/json");
						
			OutputStream os = conn.getOutputStream();
			os.write(jsonBody.getBytes());
			os.flush();
			
			BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream())));

			strReturn = String.format("%d", conn.getResponseCode());
			System.out.println("Return code from invoke .... \n");
			System.out.println(strReturn);
			System.out.println("Output from Server .... \n");
			String output;
			while ((output = br.readLine()) != null) {
				System.out.println(output);
			}

			conn.disconnect();
		} catch (MalformedURLException e) {
			strReturn = "400";
			e.printStackTrace();
		} catch (IOException e) {
			strReturn = "404";
			e.printStackTrace();
		}
	
		return strReturn;
	}

}
