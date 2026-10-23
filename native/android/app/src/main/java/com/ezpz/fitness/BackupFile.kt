package com.ezpz.fitness

import java.io.InputStream
import java.io.OutputStream
import java.io.IOException

/** Success means the closed document can be read back byte-for-byte. */
object BackupFile {
    fun save(bytes: ByteArray, output: () -> OutputStream?, input: () -> InputStream?): Int {
        (output() ?: throw IOException("Could not open the backup destination")).use {
            it.write(bytes)
            it.flush()
        }
        val actual = (input() ?: throw IOException("Could not verify the backup file")).use { it.readBytes() }
        if (!actual.contentEquals(bytes)) throw IOException("Backup file verification failed")
        return bytes.size
    }
}
